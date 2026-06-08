const CACHE_NAME='hoshi-todo-v1';
const ASSETS=['./index2.html','./manifest2.json','./icon2.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;if(!e.request.url.startsWith('http'))return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(!r||r.status!==200||r.type!=='basic')return r;const clone=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));return r}).catch(()=>e.request.headers.get('accept')?.includes('text/html')?caches.match('./index2.html'):new Response('离线',{status:408}))))});
