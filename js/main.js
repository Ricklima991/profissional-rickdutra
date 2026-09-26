document.addEventListener('DOMContentLoaded', () => {
    // Menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Scroll suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Animação ao scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                entry.target.classList.add('in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll, .reveal').forEach((element) => {
        observer.observe(element);
    });

    // Contagem progressiva dos números ao rolar até eles
    const runCounter = (el) => {
        if (el.dataset.done) return;
        el.dataset.done = "1";
        const target = parseInt(el.dataset.count, 10) || 0;
        const duration = 1600;
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const statBoxes = document.querySelectorAll('.stats > div');
    if ('IntersectionObserver' in window && statBoxes.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target.querySelector('[data-count]');
                counterObserver.unobserve(entry.target);
                if (el) runCounter(el);
            });
        }, { threshold: 0.2 });
        statBoxes.forEach((box) => counterObserver.observe(box));
    } else {
        // Fallback: mostra os valores finais direto
        document.querySelectorAll('[data-count]').forEach((el) => {
            el.textContent = el.dataset.count;
        });
    }
}); 