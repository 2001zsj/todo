/* ─── 魔法待办 Service Worker ─── */
const CACHE_NAME = 'maho-todo-v20';
const OFFLINE_CACHE = 'maho-offline-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-180.png',
  './icon-512.png'
];

/* ─── Install ─── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ─── Activate ─── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== OFFLINE_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ─── Message: 让页面通知 SW 更新缓存 ─── */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_UPDATED') {
    caches.open(CACHE_NAME).then(cache => {
      if (event.data.urls && Array.isArray(event.data.urls)) {
        event.data.urls.forEach(url => {
          fetch(url).then(r => { if (r.ok) cache.put(url, r); }).catch(() => {});
        });
      }
    });
  }
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ─── Fetch: 网络优先 + 离线缓存回归 + 自定义离线页 ─── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const isHtml = event.request.headers.get('accept')?.includes('text/html');

  if (isHtml) {
    // 网络优先 — 始终加载最新页面，离线时回退缓存
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        // 离线时仍可展示缓存的首页
        return caches.match('./index.html');
      })
    );
  } else {
    // 缓存优先 — 静态资源加速加载
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          // 图片类资源失败时返回空占位
          if (event.request.destination === 'image') {
            return new Response('', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } });
          }
          return new Response('Offline', { status: 200 });
        });
      })
    );
  }
});

