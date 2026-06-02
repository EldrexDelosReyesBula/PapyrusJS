const CACHE_NAME = 'papyr-pwa-cache-v1';
const ASSETS = [
  './',
  'index.html',
  'papyr-complete.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn('[SW Cache] Failed to add resource to cache:', asset, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Cache Storage only supports http and https request schemes
  try {
    const url = new URL(event.request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  } catch (e) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, but fetch fresh in background (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(async () => {
        // Fallback to IndexedDB replication
        if ('indexedDB' in self) {
          try {
            return new Promise((resolve) => {
              const openRequest = indexedDB.open("papyr_pwa_db", 1);
              openRequest.onsuccess = (e) => {
                const db = e.target.result;
                const transaction = db.transaction("assets", "readonly");
                const store = transaction.objectStore("assets");
                const getRequest = store.get(event.request.url);
                getRequest.onsuccess = () => {
                  if (getRequest.result && getRequest.result.content) {
                    resolve(new Response(getRequest.result.content));
                  } else {
                    resolve(new Response("Offline: Resource not cached.", { status: 503, statusText: "Offline" }));
                  }
                };
                getRequest.onerror = () => resolve(new Response("Offline", { status: 503 }));
              };
              openRequest.onerror = () => resolve(new Response("Offline", { status: 503 }));
            });
          } catch (e) {
            return new Response("Offline", { status: 503 });
          }
        }
        return new Response("Offline", { status: 503 });
      });
    })
  );
});
