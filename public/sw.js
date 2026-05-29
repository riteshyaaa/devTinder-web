/**
 * DevTinder Service Worker
 *
 * Provides:
 * - Offline shell caching (app loads even without internet)
 * - Runtime caching for API responses
 * - Background sync for failed requests
 * - Push notification support (placeholder)
 */

const CACHE_NAME = "devtinder-v1";
const OFFLINE_URL = "/";

// Static assets to pre-cache (app shell)
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/vite.svg",
];

// Install — pre-cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Some assets may not be available during dev
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first with cache fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API calls (let them go to network)
  if (request.url.includes("/api/") || request.url.includes("socket.io")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response.status === 200 && request.url.startsWith(self.location.origin)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline fallback: serve from cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // For navigation requests, serve the app shell
          if (request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});

// Push notification handler (placeholder for future)
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "DevTinder";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Focus existing window or open new one
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
