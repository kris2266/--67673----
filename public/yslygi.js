(function () {
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.modal-close');
    const bookButtons = document.querySelectorAll('.service-book-btn');
    const serviceSelect = document.getElementById('service-select');

    if (!modal) return;

    bookButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const card = btn.closest('.service-card');
            const serviceName = card ? card.dataset.service : null;

            if (serviceName && serviceSelect) {
                let found = false;
                Array.from(serviceSelect.options).forEach(function (opt) {
                    if (opt.value === serviceName || opt.textContent.trim() === serviceName) {
                        serviceSelect.value = opt.value;
                        found = true;
                    }
                });
                if (!found) {
                    const opt = document.createElement('option');
                    opt.value = serviceName;
                    opt.textContent = serviceName;
                    serviceSelect.appendChild(opt);
                    serviceSelect.value = serviceName;
                }
            }

            modal.classList.add('active');
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
})();