const CACHE_NAME = 'jlpt-study-v1';
const ASSETS = [
  'index.html',
  'manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit - return response, else fetch from network
      return response || fetch(event.request);
    })
  );
});