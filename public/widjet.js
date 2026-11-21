(function () {
  const btn = document.querySelector('.login');
  if (!btn) return;

  fetch('/api/me', { credentials: 'same-origin' })
    .then(r => r.ok ? r.json() : null)
    .then(user => {
      if (user) {
        // авторизован — в личный кабинет
        btn.href = '/cabinet';
        btn.innerHTML = '<span class="user-icon"></span><span>ПРОФИЛЬ</span>';
      } else {
        // не авторизован — на страницу входа
        btn.href = '/login.html';
        btn.innerHTML = '<span class="user-icon"></span><span>ВОЙТИ</span>';
      }
      btn.style.visibility = 'visible'; // показываем после подстановки текста
    })
    .catch(() => {
      btn.style.visibility = 'visible';
    });
})();