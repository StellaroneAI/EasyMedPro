/* EasyMedPro SW – resilient install, SPA-safe */
const SW_VERSION = 'v1.0.4';
const STATIC_CACHE = `easymedpro-static-${SW_VERSION}`;
const DYNAMIC_CACHE = `easymedpro-dynamic-${SW_VERSION}`;

const IS_LOCAL = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

const APP_SHELL = [
  '/',               // SPA fallback
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add icons back when they are valid files:
  // '/icon-192.png',
  // '/icon-512.png',
  // '/icon-maskable.png',
];

const isStaticAsset = (url) => {
  const p = url.pathname;
  return (
    p.startsWith('/assets/') ||
    /\.(?:js|css|mjs|map|png|jpg|jpeg|gif|webp|svg|ico|woff2?)$/.test(p)
  );
};

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      if (IS_LOCAL) {
        // In dev, don’t precache at all—Vite serves fresh files.
        console.info('[SW] install: skipping precache on localhost');
        return;
      }
      const cache = await caches.open(STATIC_CACHE);
      // Add each asset individually; skip failures
      for (const url of APP_SHELL) {
        try {
          const req = new Request(url, { cache: 'reload' });
          const res = await fetch(req);
          if (res && res.ok) await cache.put(req, res.clone());
        } catch (e) {
          console.warn('[SW] precache skip:', url, e);
        }
      }
    } catch (e) {
      console.warn('[SW] install error:', e);
    } finally {
      await self.skipWaiting();
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const names = await caches.keys();
      await Promise.all(
        names.map((n) => (n === STATIC_CACHE || n === DYNAMIC_CACHE) ? null : caches.delete(n))
      );
      if ('navigationPreload' in self.registration) {
        try { await self.registration.navigationPreload.enable(); } catch {}
      }
    } catch (e) {
      console.warn('[SW] activate error:', e);
    } finally {
      await self.clients.claim();
    }
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  // SPA navigations
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;
        const net = await fetch(req);
        return net;
      } catch {
        const cached = await caches.open(STATIC_CACHE).then(c => c.match('/index.html'));
        return cached || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // Static assets -> Cache First
  if (req.method === 'GET' && isStaticAsset(url)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // API & dynamic -> Network First
  if (req.method === 'GET' && (url.pathname.startsWith('/api/') ||
                               url.pathname.includes('/vitals') ||
                               url.pathname.includes('/medications') ||
                               url.pathname.includes('/appointments') ||
                               url.pathname.includes('/health-records') ||
                               url.pathname.includes('/emergency-contacts') ||
                               url.pathname.includes('/user-profile') ||
                               url.pathname.includes('/symptoms') ||
                               url.pathname.includes('/prescriptions'))) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Default
  event.respondWith(networkFirst(req));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, res.clone());
    return res;
  } catch {
    return new Response('Offline - Asset unavailable', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.destination === 'document') {
      const shell = await caches.open(STATIC_CACHE).then(c => c.match('/index.html'));
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503 });
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

console.log('[SW] Loaded', SW_VERSION);
