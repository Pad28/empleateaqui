(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = document.querySelectorAll('.reveal');

    if (!revealElements.length) return;

    document.querySelectorAll('.reveal-group').forEach((group) => {
        group.querySelectorAll(':scope > .reveal').forEach((item, index) => {
            item.style.setProperty('--reveal-delay', `${index * 0.12}s`);
        });
    });

    if (prefersReducedMotion) {
        revealElements.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: '0px 0px -5% 0px'
        }
    );

    revealElements.forEach((el) => observer.observe(el));
})();
