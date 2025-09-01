// PWA Installation Diagnostic Script
(function() {
  console.log('🔍 PWA Installation Diagnostic');
  
  // Check if HTTPS
  console.log('🔐 HTTPS:', window.location.protocol === 'https:' ? '✅' : '❌');
  
  // Check manifest
  const manifestLink = document.querySelector('link[rel="manifest"]');
  console.log('📋 Manifest link:', manifestLink ? '✅' : '❌');
  
  // Check service worker support
  console.log('⚙️ Service Worker support:', 'serviceWorker' in navigator ? '✅' : '❌');
  
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 App status: Already installed ✅');
  } else {
    console.log('📱 App status: Not installed ❌');
  }
  
  // Check for install prompt
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('🎯 Install prompt available ✅');
    console.log('🎯 Install prompt details:', e);
    deferredPrompt = e;
    
    // Show manual install button for testing
    console.log('🎯 You can now install the PWA! Check your browser menu or address bar.');
  });
  
  // Listen for app installed event
  window.addEventListener('appinstalled', (e) => {
    console.log('🎉 PWA was installed successfully!');
  });
  
  // Check iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    console.log('🍎 iOS detected - PWA installation requires Safari "Add to Home Screen"');
  }
  
  // Check Android Chrome
  const isAndroidChrome = /Android.*Chrome/.test(navigator.userAgent);
  if (isAndroidChrome) {
    console.log('🤖 Android Chrome detected - Should show install prompt');
  }
  
  // Check manifest validity
  fetch('/manifest.json')
    .then(response => response.json())
    .then(manifest => {
      console.log('📄 Manifest loaded:', manifest);
      
      // Check required fields
      const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
      const missing = required.filter(field => !manifest[field]);
      
      if (missing.length === 0) {
        console.log('✅ Manifest has all required fields');
      } else {
        console.log('❌ Missing manifest fields:', missing);
      }
      
      // Check icon formats
      const pngIcons = manifest.icons.filter(icon => icon.type === 'image/png');
      console.log('🖼️ PNG icons:', pngIcons.length > 0 ? '✅' : '❌');
      
      const has192Icon = manifest.icons.some(icon => icon.sizes === '192x192');
      const has512Icon = manifest.icons.some(icon => icon.sizes === '512x512');
      console.log('📏 Required icon sizes (192x192):', has192Icon ? '✅' : '❌');
      console.log('📏 Required icon sizes (512x512):', has512Icon ? '✅' : '❌');
    })
    .catch(error => {
      console.log('❌ Manifest fetch error:', error);
    });
  
  // Service Worker status
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration()
      .then(registration => {
        if (registration) {
          console.log('⚙️ Service Worker registered ✅');
          console.log('⚙️ Service Worker state:', registration.active?.state);
          console.log('⚙️ Service Worker scope:', registration.scope);
          
          // Check if service worker is controlling the page
          if (navigator.serviceWorker.controller) {
            console.log('⚙️ Service Worker is controlling this page ✅');
          } else {
            console.log('⚙️ Service Worker is not controlling this page ❌');
          }
        } else {
          console.log('⚙️ Service Worker not registered ❌');
        }
      });
  }
  
  // Check PWA criteria
  setTimeout(() => {
    console.log('🏁 PWA Diagnostic Complete');
    console.log('📊 PWA Installation Checklist:');
    console.log('   - HTTPS: ' + (window.location.protocol === 'https:' ? '✅' : '❌'));
    console.log('   - Manifest: ' + (document.querySelector('link[rel="manifest"]') ? '✅' : '❌'));
    console.log('   - Service Worker Support: ' + ('serviceWorker' in navigator ? '✅' : '❌'));
    console.log('   - App not already installed: ' + (!window.matchMedia('(display-mode: standalone)').matches ? '✅' : '❌'));
    
    navigator.serviceWorker.getRegistration().then(reg => {
      console.log('   - Service Worker Registered: ' + (reg ? '✅' : '❌'));
      console.log('   - Service Worker Active: ' + (reg?.active ? '✅' : '❌'));
      
      const allGood = window.location.protocol === 'https:' && 
                     document.querySelector('link[rel="manifest"]') && 
                     'serviceWorker' in navigator && 
                     reg && 
                     reg.active &&
                     !window.matchMedia('(display-mode: standalone)').matches;
                     
      console.log('🎯 Ready for PWA Installation: ' + (allGood ? '✅ YES!' : '❌ NO'));
      
      if (!allGood) {
        console.log('💡 If all criteria are met but install prompt still doesn\'t appear, try:');
        console.log('   1. Hard refresh (Ctrl+F5)');
        console.log('   2. Clear browser cache');
        console.log('   3. Check if already installed');
        console.log('   4. Try in incognito mode');
      }
    });
  }, 2000);
})();
