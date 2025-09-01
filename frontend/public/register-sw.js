// Enhanced Service Worker Registration
(function() {
  if ('serviceWorker' in navigator) {
    console.log('🔧 Starting Service Worker registration...');
    
    window.addEventListener('load', function() {
      // First, unregister any existing service workers
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        if (registrations.length > 0) {
          console.log('🔄 Found existing registrations, cleaning up...');
          Promise.all(registrations.map(reg => reg.unregister())).then(() => {
            registerServiceWorker();
          });
        } else {
          registerServiceWorker();
        }
      });
    });
    
    function registerServiceWorker() {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      .then(function(registration) {
        console.log('✅ Service Worker registered successfully!');
        console.log('📍 Scope:', registration.scope);
        console.log('📄 SW URL:', registration.scope + 'sw.js');
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Service Worker update found');
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            console.log('🔄 SW State:', newWorker.state);
            
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🎉 New service worker available!');
            }
          });
        });
        
        // Force update check
        registration.update();
        
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
    });
    
    // Handle controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed - page will reload');
      window.location.reload();
    });
    
    // Check service worker state periodically
    setInterval(() => {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.active) {
          console.log('💚 SW Status: Active and running');
        } else {
          console.log('⚠️ SW Status: Not active');
        }
      });
    }, 5000);
    
  } else {
    console.log('❌ Service Worker not supported by this browser');
  }
})();