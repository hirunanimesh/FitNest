// Simple Service Worker for testing
const CACHE_NAME = 'fitnest-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  console.log('🔧 SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('🔧 SW: Caching basic files');
        return cache.addAll(urlsToCache.filter(url => url !== '/'));
      })
      .catch(err => {
        console.log('🔧 SW: Cache error (ignoring):', err);
        return Promise.resolve();
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('🔧 SW: Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🔧 SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

console.log('🔧 SW: Simple service worker loaded');
