/* ─── 魔法待办 Service Worker ─── */
const CACHE_NAME = 'maho-todo-v7';
// icon 文件列表（manifest 不被缓存，始终走网络）
const ASSETS = [
  './',
  './index.html',
  './icon.svg',
  './icon-192.png',
  './icon-180.png',
  './icon-512.png'
];

/* ─── Install: 预缓存核心文件 ─── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ─── Activate: 清理旧缓存 ─── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ─── Fetch: 缓存优先 + 网络回退 ─── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
        return new Response('离线中…', { status: 408 });
      });
    })
  );
});
