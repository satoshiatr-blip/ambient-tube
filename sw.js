const CACHE = 'ambient-v10';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'no-store' }))))); });
// github.io は他のアプリと同じオリジンなので、自分のキャッシュ(ambient-)以外は消さない
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ambient-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => {
    if (r.ok) { const c = r.clone(); e.waitUntil(caches.open(CACHE).then(x => x.put(e.request, c))); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' })));
});
