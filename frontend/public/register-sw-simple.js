// Simple Service Worker Registration for Testing
(function() {
  if ('serviceWorker' in navigator) {
    console.log('🔧 Starting SIMPLE Service Worker registration...');
    
    window.addEventListener('load', function() {
      // Unregister existing service workers first
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        Promise.all(registrations.map(reg => reg.unregister())).then(() => {
          console.log('🔄 Cleared existing service workers');
          registerSimpleServiceWorker();
        });
      });
    });
    
    function registerSimpleServiceWorker() {
      navigator.serviceWorker.register('/sw-simple.js', {
        scope: '/'
      })
      .then(function(registration) {
        console.log('✅ SIMPLE Service Worker registered successfully!');
        console.log('📍 Scope:', registration.scope);
        
        // Wait for service worker to be active
        if (registration.installing) {
          console.log('🔧 SW: Installing...');
          registration.installing.addEventListener('statechange', function() {
            console.log('🔧 SW State:', this.state);
            if (this.state === 'activated') {
              console.log('🎉 Service Worker is now active!');
            }
          });
        } else if (registration.active) {
          console.log('🎉 Service Worker is already active!');
        }
        
        return registration;
      })
      .catch(function(error) {
        console.error('❌ SIMPLE Service Worker registration failed:', error);
      });
    }
    
    // Check service worker state
    setInterval(() => {
      navigator.serviceWorker.getRegistration('/sw-simple.js').then(registration => {
        if (registration && registration.active) {
          console.log('💚 SIMPLE SW: Active ✅');
        } else {
          console.log('⚠️ SIMPLE SW: Not active ❌');
        }
      });
    }, 3000);
    
  } else {
    console.log('❌ Service Worker not supported by this browser');
  }
})();
