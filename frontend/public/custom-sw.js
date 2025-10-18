// Custom service worker configuration to prevent API caching
// This file ensures PWA installation works but APIs are never cached

// Import the default next-pwa service worker
importScripts('/sw.js');

// Override fetch event to explicitly bypass cache for API calls
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // If it's an API call, always fetch from network (never cache)
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request.clone())
        .catch(() => {
          // If network fails, return a basic error response instead of cached data
          return new Response(
            JSON.stringify({ 
              error: 'Network error', 
              message: 'Unable to connect to server' 
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // For all other requests, let the default service worker handle them
  // This allows PWA installation and caching of static resources only
});