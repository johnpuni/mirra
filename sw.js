const CACHE_NAME = 'mirrativ-costume-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;

  // JSONは絶対にキャッシュしない
  if (req.url.endsWith('.json')) {
    e.respondWith(fetch(req));
    return;
  }

  // 画像はネット優先
  if (req.destination === 'image') {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // その他は通常fetch
  e.respondWith(fetch(req));
});
