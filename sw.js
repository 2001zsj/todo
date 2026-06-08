/* ─── 魔法待办 Service Worker ─── */
const CACHE_NAME = 'maho-todo-v2';
const ASSETS = [
  '/index.html',
  '/manifest.json',
  '/icon.svg'
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
  // 只处理 GET
  if (event.request.method !== 'GET') return;

  // 跳过非 HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // 有缓存直接用
      if (cached) return cached;

      // 没缓存走网络
      return fetch(event.request).then(response => {
        // 不缓存跨域请求和非成功响应
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 缓存副本
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return response;
      }).catch(() => {
        // 网络也失败 → 返回离线页（HTML请求才处理）
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
        return new Response('离线中…', { status: 408 });
      });
    })
  );
});
