// Enhanced Service Worker Registration with Offline Support
(function() {
  if ('serviceWorker' in navigator) {
    console.log('🔧 Starting Service Worker registration...');
    
    window.addEventListener('load', function() {
      registerServiceWorker();
    });
    
    function registerServiceWorker() {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      .then(function(registration) {
        console.log('✅ Service Worker registered successfully!');
        console.log('📍 Scope:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update found');
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            console.log('🔄 SW State:', newWorker.state);
            
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🎉 New service worker available!');
              // Show update notification to user
              showUpdateNotification();
            }
          });
        });
        
        // Force update check periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
        
        return registration;
      })
      .catch(function(error) {
        console.error('❌ Service Worker registration failed:', error);
        console.log('🔍 Troubleshooting:');
        console.log('   1. Check if /sw.js file exists');
        console.log('   2. Verify HTTPS connection');
        console.log('   3. Clear browser cache');
        console.log('   4. Check browser console for detailed errors');
      });
    }
    
    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', event => {
      console.log('📢 SW Message:', event.data);
      
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'CACHE_UPDATED':
            console.log('📦 Cache updated:', event.data.payload);
            break;
          case 'OFFLINE_FALLBACK':
            console.log('🔌 Offline fallback activated');
            break;
        }
      }
    });
    
    // Handle controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed - page will reload');
      window.location.reload();
    });
    
    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Back online - syncing data...');
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SYNC_DATA' });
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('🔌 Gone offline - cached content available');
    });
    
    // Preload critical resources
    preloadCriticalResources();
    
    function showUpdateNotification() {
      // You can implement a custom notification here
      if (confirm('🎉 New version available! Reload to update?')) {
        window.location.reload();
      }
    }
    
    function preloadCriticalResources() {
      const criticalResources = [
        '/',
        '/dashboard/user',
        '/dashboard/gym', 
        '/dashboard/trainer',
        '/manifest.json'
      ];
      
      if ('caches' in window) {
        caches.open('critical-cache').then(cache => {
          cache.addAll(criticalResources).catch(err => {
            console.log('⚠️ Failed to preload some resources:', err);
          });
        });
      }
    }
    
  } else {
    console.log('❌ Service Worker not supported by this browser');
  }
})();