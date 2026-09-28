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

    // PWA install + share
    let deferredPrompt = null;
    const installBtn = document.getElementById('pwa-install');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.style.display = 'inline-flex';
    });
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });
    }
    const shareBtn = document.getElementById('pwa-share');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const data = { title: 'Estúdio Rick Digital', text: 'Fanpages que convertem e sites ultraprofissionais — veja o portfólio:', url: location.href };
            if (navigator.share) { try { await navigator.share(data); } catch (_) {} }
            else { try { await navigator.clipboard.writeText(data.url); alert('Link copiado!'); } catch (_) {} }
        });
    }
}); 