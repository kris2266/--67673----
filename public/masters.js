(function () {
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.modal-close');
    const bookingForm = document.querySelector('.booking-form');
    const masterSelect = document.getElementById('master-select');
    const bookButtons = document.querySelectorAll('.master-book-btn');

    // Открытие модалки по кнопке "записаться"
    bookButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            // Если у карточки есть data-master — подставим его в select
            const card = btn.closest('.master-card');
            const masterName = card ? card.dataset.master : null;

            if (masterName && masterSelect) {
                Array.from(masterSelect.options).forEach(function (opt) {
                    if (opt.value === masterName || opt.textContent.trim() === masterName) {
                        masterSelect.value = opt.value;
                    }
                });
            }

            modal.classList.add('active');
        });
    });

    // Закрытие по крестику
    closeBtn.addEventListener('click', function () {
        modal.classList.remove('active');
    });

    // Закрытие по клику на оверлей
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Отправка формы
    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('спасибо за запись!! заявка отправлена администратору');
        modal.classList.remove('active');
        this.reset();
    });
})();