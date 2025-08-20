/* Speech Fun Games – Service Worker
   Offline + installable PWA
*/
const SW_VERSION = 'sfg-v1.0.0';
const CACHE_NAME = `sfg-cache-${SW_VERSION}`;

// Keep this list lean; it should include only files required to boot offline.
// Everything else (images/audio) is handled via runtime caching below.
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',

  // minimal UI icons used by the page
  './icons/speaker_darkpink_32px.png',
  './icons/speaker_darkpink_48px.png',
  './icons/speaker_darkpink_64px.png',

  // app icons (if present)
  './icons/app-icon-192.png',
  './icons/app-icon-512.png'
];

// Cache core assets, but don't fail install if some are missing.
async function cacheCoreAssets() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    CORE_ASSETS.map(async (url) => {
      try {
        await cache.add(new Request(url, { cache: 'no-cache' }));
      } catch (_) {
        // ignore missing optional assets
      }
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await cacheCoreAssets();
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith('sfg-cache-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Runtime strategies:
// - Navigations (HTML): network-first, fallback to cache, then to index.html
// - Images/icons: cache-first
// - Audio: stale-while-revalidate (play fast, refresh quietly)
// - Default: cache falling back to network
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirstHTML(req));
    return;
  }

  if (req.destination === 'image') {
    event.respondWith(cacheFirst(req));
    return;
  }

  if (req.destination === 'audio') {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  event.respondWith(cacheFallingBackToNetwork(req));
});

/* --- Strategies --- */
async function networkFirstHTML(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request);
    cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // SPA fallback
    const index = await cache.match('./index.html');
    return index || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    cache.put(request, res.clone());
    return res;
  } catch {
    return new Response('', { status: 404 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((res) => {
      cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || networkPromise || new Response('', { status: 404 });
}

async function cacheFallingBackToNetwork(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    cache.put(request, res.clone());
    return res;
  } catch {
    return new Response('', { status: 404 });
  }
}

/* Optional: allow immediate activation via postMessage */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
