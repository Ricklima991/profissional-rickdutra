document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const isMobile = window.innerWidth < 720;

    /* ---------- Preloader ---------- */
    const preloader = document.getElementById('preloader');
    const loadbar = document.getElementById('loadbar');
    const loadpct = document.getElementById('loadpct');
    let pct = 0;
    const tick = setInterval(() => {
        pct = Math.min(100, pct + Math.random() * 22);
        if (loadbar) loadbar.style.width = pct + '%';
        if (loadpct) loadpct.textContent = Math.floor(pct) + '%';
        if (pct >= 100) {
            clearInterval(tick);
            setTimeout(() => preloader && preloader.classList.add('done'), 250);
        }
    }, 120);
    setTimeout(() => { // segurança: nunca trava
        clearInterval(tick);
        if (preloader) preloader.classList.add('done');
    }, 2500);

    /* ---------- Menu mobile ---------- */
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));

    /* ---------- Scroll suave ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); navMenu && navMenu.classList.remove('active'); }
        });
    });

    /* ---------- Barra de progresso ---------- */
    const progress = document.getElementById('scroll-progress');
    const onScrollBar = () => {
        if (!progress) return;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScrollBar, { passive: true }); onScrollBar();

    /* ---------- Reveal (GSAP se houver, senão fallback) ---------- */
    const els = document.querySelectorAll('.animate-on-scroll, .reveal');
    if (!reduceMotion && window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        els.forEach(el => {
            el.style.opacity = '1'; el.style.transform = 'none'; // GSAP controla
            gsap.fromTo(el, { y: 34, opacity: 0 }, {
                y: 0, opacity: 1, duration: .9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%' }
            });
        });
        // Parallax leve no hero
        const heroLeft = document.querySelector('[data-hero-parallax]');
        const heroRight = document.querySelector('[data-tilt-stage]');
        if (heroLeft) gsap.to(heroLeft, { y: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
        if (heroRight) gsap.to(heroRight, { y: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    } else {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('animate'); entry.target.classList.add('in'); } });
        }, { threshold: 0.1 });
        els.forEach(el => obs.observe(el));
    }

    /* ---------- Contadores animados ---------- */
    const stats = document.querySelector('[data-counters]');
    if (stats) {
        const run = () => {
            stats.querySelectorAll('strong').forEach(s => {
                const raw = s.textContent.trim();
                const num = parseInt(raw, 10);
                if (isNaN(num)) return;
                const suffix = raw.replace(/[0-9]/g, '');
                const t0 = performance.now(), dur = 1200;
                const step = (t) => {
                    const p = Math.min(1, (t - t0) / dur);
                    s.textContent = Math.floor(num * (1 - Math.pow(1 - p, 3))) + suffix;
                    if (p < 1) requestAnimationFrame(step);
                };
                if (!reduceMotion) requestAnimationFrame(step);
            });
        };
        new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .4 }).observe(stats);
    }

    /* ---------- Tilt 3D sutil (desktop apenas) ---------- */
    if (finePointer && !reduceMotion && !isMobile) {
        document.querySelectorAll('.tilt, .work-card, .cap, .bio-card, .all-grid a, .steps > div, .tools a span').forEach(card => {
            const max = parseFloat(card.dataset.tilt || '7');
            let raf = null;
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - .5;
                const py = (e.clientY - r.top) / r.height - .5;
                card.style.setProperty('--mx', ((px + .5) * 100) + '%');
                card.style.setProperty('--my', ((py + .5) * 100) + '%');
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    card.style.transform = `perspective(900px) rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg) translateZ(0)`;
                });
            });
            card.addEventListener('mouseleave', () => {
                if (raf) cancelAnimationFrame(raf);
                card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
            });
        });
    }

    /* ---------- Botões magnéticos ---------- */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('[data-magnetic]').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    /* ---------- Cursor premium ---------- */
    if (finePointer && !reduceMotion) {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        let mx = -100, my = -100, rx = -100, ry = -100;
        window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; } });
        (function loop() { rx += (mx - rx) * .16; ry += (my - ry) * .16; if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; } requestAnimationFrame(loop); })();
        document.querySelectorAll('a, button, .tilt').forEach(el => {
            el.addEventListener('mouseenter', () => ring && ring.classList.add('hovering'));
            el.addEventListener('mouseleave', () => ring && ring.classList.remove('hovering'));
        });
    }

    /* ---------- Fundo 3D: partículas champagne (Three.js) ---------- */
    try {
        const canvas = document.getElementById('bg3d');
        if (canvas && window.THREE && !reduceMotion) {
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(60, 1, .1, 100);
            camera.position.z = 8;
            const resize = () => {
                renderer.setSize(window.innerWidth, window.innerHeight, false);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            };
            resize(); window.addEventListener('resize', resize);

            // Partículas
            const N = isMobile ? 350 : 900;
            const pos = new Float32Array(N * 3);
            for (let i = 0; i < N; i++) {
                pos[i * 3] = (Math.random() - .5) * 22;
                pos[i * 3 + 1] = (Math.random() - .5) * 14;
                pos[i * 3 + 2] = (Math.random() - .5) * 10;
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const mat = new THREE.PointsMaterial({ color: 0xd8c3a5, size: .035, transparent: true, opacity: .55, sizeAttenuation: true });
            const points = new THREE.Points(geo, mat);
            scene.add(points);

            // Grade sutil / névoa: segundo layer dourado fraco
            const mat2 = new THREE.PointsMaterial({ color: 0xffffff, size: .02, transparent: true, opacity: .25 });
            const points2 = new THREE.Points(geo.clone(), mat2);
            points2.position.x = 2; scene.add(points2);

            let tx = 0, ty = 0;
            if (finePointer) window.addEventListener('mousemove', (e) => {
                tx = (e.clientX / window.innerWidth - .5);
                ty = (e.clientY / window.innerHeight - .5);
            });

            const clock = new THREE.Clock();
            let visible = true;
            new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(document.querySelector('.hero'));
            (function animate() {
                requestAnimationFrame(animate);
                const t = clock.getElapsedTime();
                // Pausa render fora da dobra pra economizar bateria — mas mantém fundo visível
                const y = window.scrollY;
                const fade = Math.max(.25, 1 - y / (window.innerHeight * 2.2));
                canvas.style.opacity = fade.toFixed(2);
                points.rotation.y = t * .03 + tx * .4;
                points.rotation.x = ty * .25;
                points.position.y = Math.sin(t * .3) * .15;
                points2.rotation.y = -t * .015 + tx * .2;
                renderer.render(scene, camera);
            })();
        } else if (canvas) { canvas.style.display = 'none'; }
    } catch (_) { const c = document.getElementById('bg3d'); if (c) c.style.display = 'none'; }

    /* ---------- PWA install + share (mantido) ---------- */
    let deferredPrompt = null;
    const installBtn = document.getElementById('pwa-install');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); deferredPrompt = e;
        if (installBtn) installBtn.style.display = 'inline-flex';
    });
    if (installBtn) installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt(); await deferredPrompt.userChoice;
        deferredPrompt = null; installBtn.style.display = 'none';
    });
    const shareBtn = document.getElementById('pwa-share');
    if (shareBtn) shareBtn.addEventListener('click', async () => {
        const data = { title: 'Estúdio Rick Digital', text: 'Fanpages que convertem e sites ultraprofissionais — veja o portfólio:', url: location.href };
        if (navigator.share) { try { await navigator.share(data); } catch (_) {} }
        else { try { await navigator.clipboard.writeText(data.url); alert('Link copiado!'); } catch (_) {} }
    });
});
