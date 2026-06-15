(function () {
    'use strict';

    const bloomButtons = document.querySelectorAll('.click-bloom, .btn-submit-bloom');

    bloomButtons.forEach((button) => {
        button.addEventListener('click', function () {
            this.classList.add('bloom-active');
            setTimeout(() => this.classList.remove('bloom-active'), 450);
        });
    });

    const form = document.getElementById('subscribe-form');
    if (!form) return;

    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        if (!email) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Enviando...</span>';
        formStatus.textContent = '';
        formStatus.className = 'form-status';

        const isLocalFile = window.location.protocol === 'file:';
        const apiUrl = isLocalFile ? 'http://localhost:5555/api/contact' : '/api/contact';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'No pudimos procesar tu registro.');
            }

            formStatus.textContent = '¡Gracias! Nuestro equipo se pondrá en contacto contigo pronto.';
            formStatus.className = 'form-status form-status--success';
            form.reset();
        } catch (error) {
            formStatus.textContent = error.message;
            formStatus.className = 'form-status form-status--error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Enviar</span>';
        }
    });
})();
