(function() {
    // ===== НАСТРОЙКИ =====
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
];
    // Текущая дата (для демонстрации — ноябрь 2026)
    let currentYear = 2026;
    let currentMonth = 10; // 0 = январь, 10 = ноябрь

    // Занятые слоты (день месяца → массив временных меток)
    const busySlots = {
        5: ['16:00', '18:00'],
        14: ['18:00']
    };

    // ===== DOM ЭЛЕМЕНТЫ =====
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('monthLabel');
    const modal = document.getElementById('bookingModal');
    const modalDateSpan = document.getElementById('modalDate');
    const closeBtn = document.querySelector('.modal-close');
    const bookingForm = document.querySelector('.booking-form');

    // ===== ГЕНЕРАЦИЯ КАЛЕНДАРЯ =====
    function renderCalendar() {
        // Удаляем все ячейки, кроме заголовков дней недели (первые 7)
        const headers = Array.from(grid.children).slice(0, 7);
        grid.innerHTML = '';
        headers.forEach(h => grid.appendChild(h));

        // Название месяца
        monthLabel.textContent = monthNames[currentMonth];

        // Первый день месяца (0 = воскресенье, 1 = понедельник, ...)
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        // Приводим к понедельнику как первому дню (0 = пн, 6 = вс)
        const offset = (firstDay === 0) ? 6 : firstDay - 1;

        // Количество дней в месяце
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Пустые ячейки для выравнивания
        for (let i = 0; i < offset; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-cell';
            grid.appendChild(empty);
        }

        // Ячейки с днями
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            cell.dataset.day = day;

            // Бледная цифра
            const num = document.createElement('span');
            num.className = 'day-number';
            num.textContent = day;
            cell.appendChild(num);

            // Существующие записи
            if (busySlots[day]) {
                busySlots[day].forEach((time, idx) => {
                    const slot = document.createElement('div');
                    slot.className = 'appointment-slot';
                    slot.textContent = time;
                    slot.style.top = (30 + idx * 30) + '%';
                    cell.appendChild(slot);
                });
            }

            // Обработчик клика для свободных ячеек
            cell.addEventListener('click', function(e) {
                // Не открываем, если кликнули по слоту записи
                if (e.target.classList.contains('appointment-slot')) return;

                // Проверяем, есть ли уже записи
                if (busySlots[day]) return; // занято — не открываем

                // Открываем модальное окно
                modalDateSpan.textContent = day + ' ' + monthNames[currentMonth];
                modal.classList.add('active');
            });

            grid.appendChild(cell);
        }

        // Добавляем пустые ячейки в конце для красоты (опционально)
        const totalCells = offset + daysInMonth;
        const remainder = totalCells % 7;
        if (remainder !== 0) {
            for (let i = 0; i < 7 - remainder; i++) {
                const empty = document.createElement('div');
                empty.className = 'calendar-cell';
                grid.appendChild(empty);
            }
        }
    }

    // ===== ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА =====
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // ===== ОБРАБОТКА ФОРМЫ =====
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Спасибо за запись! Ваша заявка отправлена администратору.');
        modal.classList.remove('active');
        this.reset();
    });

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    renderCalendar();
})();