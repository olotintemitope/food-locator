const cacheName = 'food-locator';
const cacheVersion = `${cacheName}::1.0.0`;

const cachedFiles = [
  '/',
  '/restaurant.html?id=${id}',
  '/img/',
  '/css/',
  '/js/',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon-2x.png',
  '//normalize-css.googlecode.com/svn/trunk/normalize.css',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'manifest.json',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
];

const networkFiles = [];

self.addEventListener('install', event => {
  console.log('[pwa install]');

  event.waitUntil(
    caches.open(cacheVersion)
    .then(cache => cache.addAll(cachedFiles))
  );

});

self.addEventListener('activate', event => {
  console.log('[pwa activate]');

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key.indexOf(cacheName) === 0 && key !== cacheVersion)
        .map(key => caches.delete(key))
      )
    )
  );

  return self.clients.claim();

});

self.addEventListener('fetch', event => {
  if (networkFiles.filter(item => event.request.url.match(item)).length) {
    console.log('[network fetch]', event.request.url);

    event.respondWith(
      caches.match(event.request)
      .then(response => response || fetch(event.request))
    );

  } else {
    console.log('[pwa fetch]', event.request.url);

    event.respondWith(
      caches.match(event.request)
      .then(response => {

        caches.open(cacheVersion).then(cache => cache.add(event.request.url));

        return response || fetch(event.request);

      })
    );

  }

});