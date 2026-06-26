var CACHE_NAME = 'dante-cache-v1';
var URLS_TO_CACHE = [
  '/',
  '/style.css',
  '/nav.js',
  '/i18n.js',
  '/settings.js',
  '/script.js',
  '/manifest.json',
  '/assets/Animations/search.css',
  '/assets/DanteElGamerCharLogo.png',
  '/assets/DanteElGamerWhiteLogo.png',
  '/404.html',
  '/about/',
  '/projects/',
  '/games/',
  '/colabs/',
  '/merch/',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.map(function (name) {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
});
