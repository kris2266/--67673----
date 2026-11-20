(function () {
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.modal-close');
    const bookingForm = document.querySelector('.booking-form');
    const bookButtons = document.querySelectorAll('.service-book-btn');
    const serviceSelect = document.getElementById('service-select');

    bookButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const card = btn.closest('.service-card');
            const serviceName = card ? card.dataset.service : null;

            if (serviceName && serviceSelect) {
                // Ищем опцию с таким названием
                let found = false;
                Array.from(serviceSelect.options).forEach(function (opt) {
                    if (opt.value === serviceName || opt.textContent.trim() === serviceName) {
                        serviceSelect.value = opt.value;
                        found = true;
                    }
                });

                // Если опции нет — создаём на лету и выбираем
                if (!found) {
                    const newOption = document.createElement('option');
                    newOption.value = serviceName;
                    newOption.textContent = serviceName;
                    serviceSelect.appendChild(newOption);
                    serviceSelect.value = serviceName;
                }
            }

            modal.classList.add('active');
        });
    });

    closeBtn.addEventListener('click', function () {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('спасибо за запись!! заявка отправлена администратору');
        modal.classList.remove('active');
        this.reset();
    });
})();