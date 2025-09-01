// Manual PWA Installation Tester
// Use this in browser console to test PWA installation manually

function testPWAInstallation() {
  console.log('🧪 Manual PWA Installation Test');
  
  // Test service worker registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Manual SW Registration Success:', registration);
        
        // Wait for service worker to be ready
        return navigator.serviceWorker.ready;
      })
      .then(registration => {
        console.log('✅ Service Worker Ready:', registration);
        
        // Test if install prompt is available
        window.addEventListener('beforeinstallprompt', (e) => {
          console.log('🎯 Install prompt detected!');
          e.preventDefault();
          
          // Show install prompt
          e.prompt();
          
          e.userChoice.then(choiceResult => {
            console.log('👤 User choice:', choiceResult.outcome);
          });
        });
        
        // Force check for updates
        registration.update();
      })
      .catch(error => {
        console.error('❌ SW Registration Error:', error);
      });
  }
  
  // Test manifest
  fetch('/manifest.json')
    .then(response => {
      if (!response.ok) throw new Error('Manifest not found');
      return response.json();
    })
    .then(manifest => {
      console.log('✅ Manifest loaded:', manifest);
      
      // Validate critical fields
      const checks = {
        'Name': manifest.name,
        'Short Name': manifest.short_name,
        'Start URL': manifest.start_url,
        'Display Mode': manifest.display,
        'Icons Count': manifest.icons?.length,
        'PNG Icons': manifest.icons?.filter(i => i.type === 'image/png').length
      };
      
      console.table(checks);
    })
    .catch(error => {
      console.error('❌ Manifest Error:', error);
    });
}

// Auto-run test
testPWAInstallation();

// Add to global for manual testing
window.testPWAInstallation = testPWAInstallation;

console.log('💡 You can run testPWAInstallation() anytime to test PWA manually');
