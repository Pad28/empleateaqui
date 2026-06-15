(function () {
    'use strict';

    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('main-nav');
    const overlay = document.querySelector('.nav-overlay');

    if (!toggle || !nav || !overlay) return;

    function setMenuOpen(isOpen) {
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
        nav.classList.toggle('is-open', isOpen);
        overlay.classList.toggle('is-active', isOpen);
        document.body.classList.toggle('nav-open', isOpen);
    }

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        setMenuOpen(!isOpen);
    });

    overlay.addEventListener('click', () => setMenuOpen(false));

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setMenuOpen(false);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) setMenuOpen(false);
    });
})();
