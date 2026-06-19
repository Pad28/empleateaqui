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

    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    const fieldIds = ['nombre', 'empresa', 'email', 'telefono', 'perfil', 'urgencia'];

    function getContactPayload() {
        return fieldIds.reduce((payload, id) => {
            const input = document.getElementById(id);
            payload[id] = input ? input.value.trim() : '';
            return payload;
        }, {});
    }

    function getApiUrl() {
        if (window.location.protocol === 'file:') {
            return 'http://localhost:5555/api/contact';
        }
        return '/api/contact';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            const firstInvalid = form.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.focus({ preventScroll: true });
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            form.reportValidity();
            return;
        }

        const payload = getContactPayload();

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Enviando...</span>';
        formStatus.textContent = '';
        formStatus.className = 'form-status';

        try {
            const response = await fetch(getApiUrl(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let data = {};
            try {
                data = await response.json();
            } catch (_) {
                throw new Error('No pudimos procesar tu solicitud. Inténtalo más tarde.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'No pudimos procesar tu solicitud.');
            }

            formStatus.textContent = data.message || '¡Gracias! Nuestro equipo se pondrá en contacto contigo pronto.';
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
