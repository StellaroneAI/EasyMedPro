importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

// Precache core assets.
workbox.precaching.precacheAndRoute([
  {url: '/', revision: null},
  {url: '/index.html', revision: null},
  {url: '/manifest.json', revision: null},
  {url: '/offline.html', revision: null}
]);

// Provide offline fallback for navigation requests.
workbox.routing.setCatchHandler(async ({event}) => {
  if (event.request.mode === 'navigate') {
    return caches.match('offline.html', {ignoreSearch: true});
  }
  return Response.error();
});

// Runtime caching for images.
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'images'
  })
);

// Runtime caching for same-origin pages and assets.
workbox.routing.registerRoute(
  ({request, url}) => url.origin === self.location.origin &&
    ['document', 'script', 'style'].includes(request.destination),
  new workbox.strategies.NetworkFirst({
    cacheName: 'assets'
  })
);
