/* Estúdio Rick Digital — Service Worker */
const CACHE = 'rick-digital-v1';
const CORE = [
  '/profissional-rickdutra/',
  '/profissional-rickdutra/index.html',
  '/profissional-rickdutra/sobre.html',
  '/profissional-rickdutra/projetos.html',
  '/profissional-rickdutra/tecnologias.html',
  '/profissional-rickdutra/termos.html',
  '/profissional-rickdutra/css/style.css',
  '/profissional-rickdutra/js/main.js',
  '/profissional-rickdutra/manifest.webmanifest',
  '/profissional-rickdutra/img/icon-192.png',
  '/profissional-rickdutra/img/icon-512.png',
  '/profissional-rickdutra/img/maskable-512.png',
  '/profissional-rickdutra/img/logo-rd.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  // Navegação: network-first com fallback offline
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      }).catch(() => caches.match(request).then((m) => m || caches.match('/profissional-rickdutra/index.html')))
    );
    return;
  }
  // Assets: cache-first
  e.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res.ok && new URL(request.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      });
    })
  );
});
