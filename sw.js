// Simple service worker for Jannah Islamic Prayer Tracker
// Provides basic caching for offline functionality

const CACHE_NAME = "jannah-v1";
const isDevelopment =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1";

// Only cache essential files for production
const urlsToCache = ["/", "/index.html", "/manifest.json"];

// Install event - cache resources
self.addEventListener("install", (event) => {
  if (isDevelopment) {
    // Skip caching in development
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log("Cache installation failed:", error);
      }),
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Skip caching in development
  if (isDevelopment) {
    return;
  }

  // Only cache GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch((error) => {
        console.log("Fetch failed:", error);
        // Return offline page or default response
        return new Response("App is offline", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
