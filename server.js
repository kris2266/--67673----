const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database(path.join(__dirname, 'handy.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service TEXT NOT NULL,
    master TEXT NOT NULL,
    address TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    booking_time TEXT,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);
try {
  db.exec(`ALTER TABLE bookings ADD COLUMN booking_time TEXT`);
} catch (e) {
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'handy-secret-key-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.static(path.join(__dirname, 'public')));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login.html');
  next();
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post('/api/register', (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль минимум 6 символов' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (exists) {
    return res.status(400).json({ error: 'Такой телефон уже зарегистрирован' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(
    'INSERT INTO users (name, phone, password) VALUES (?, ?, ?)'
  ).run(name, phone, hash);

  req.session.userId = info.lastInsertRowid;
  req.session.userName = name;
  req.session.userPhone = phone;

  res.json({ ok: true });
});

app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: 'Неверный телефон или пароль' });
  }

  req.session.userId = user.id;
  req.session.userName = user.name;
  req.session.userPhone = user.phone;

  res.json({ ok: true });
});

app.get('/api/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});
app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Не авторизован' });
  res.json({
    id: req.session.userId,
    name: req.session.userName,
    phone: req.session.userPhone
  });
});
app.get('/cabinet', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/api/busy', (req, res) => {
  const allBusy = db.prepare(
    "SELECT booking_date, booking_time, master FROM bookings WHERE status = 'active'"
  ).all();
  res.json(allBusy);
});

app.post('/api/bookings', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  const {
    service, master, address, booking_date, booking_time,
    client_name, client_phone, price, image
  } = req.body;

  if (!service || !master || !address || !booking_date || !booking_time || !client_name || !client_phone) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  const conflict = db.prepare(`
    SELECT id FROM bookings
    WHERE booking_date = ? AND booking_time = ? AND master = ? AND status = 'active'
  `).get(booking_date, booking_time, master);

  if (conflict) {
    return res.status(409).json({ error: 'Это время у данного мастера уже занято' });
  }

  const info = db.prepare(`
    INSERT INTO bookings
      (user_id, service, master, address, booking_date, booking_time, client_name, client_phone, price, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.session.userId,
    service, master, address, booking_date, booking_time,
    client_name, client_phone,
    Number(price) || 0,
    image || null
  );

  res.json({ ok: true, id: info.lastInsertRowid });
});

app.get('/api/bookings', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  const active = db.prepare(
    "SELECT * FROM bookings WHERE user_id = ? AND status = 'active' ORDER BY booking_date ASC, booking_time ASC"
  ).all(req.session.userId);

  const done = db.prepare(
    "SELECT * FROM bookings WHERE user_id = ? AND status = 'done' ORDER BY booking_date DESC, booking_time DESC"
  ).all(req.session.userId);

  res.json({ active, done });
});

app.get('/api/bookings/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  const booking = db.prepare(
    'SELECT * FROM bookings WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.session.userId);

  if (!booking) return res.status(404).json({ error: 'Не найдено' });
  res.json(booking);
});

app.post('/api/bookings/:id/done', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  const bookingId = req.params.id;

  const booking = db.prepare('SELECT id FROM bookings WHERE id = ? AND user_id = ?').get(bookingId, req.session.userId);

  if (!booking) {
    return res.status(404).json({ error: 'Запись не найдена' });
  }

  db.prepare("UPDATE bookings SET status = 'done' WHERE id = ?").run(bookingId);

  res.json({ ok: true });
});

app.get('/api/reviews', (req, res) => {
  const reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { author, rating, text } = req.body;

  if (!author || !rating || !text) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  const info = db.prepare(
    'INSERT INTO reviews (author, rating, text) VALUES (?, ?, ?)'
  ).run(author, Number(rating), text);

  res.json({ ok: true, id: info.lastInsertRowid });
});

app.listen(3001, () => {
  console.log('Сервер запущен: http://localhost:3001');
});