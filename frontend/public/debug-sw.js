// Simple Service Worker Test
// Paste this directly in browser console to debug SW issues

async function debugServiceWorker() {
  console.log('🔧 Service Worker Debug Test');
  
  // Check if service worker is supported
  if (!('serviceWorker' in navigator)) {
    console.error('❌ Service Worker not supported');
    return;
  }
  
  console.log('✅ Service Worker supported');
  
  try {
    // Check if SW file exists
    const swResponse = await fetch('/sw.js');
    console.log('📄 SW File Status:', swResponse.status);
    
    if (swResponse.ok) {
      console.log('✅ Service Worker file exists');
      
      // Try to register
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Registration successful:', registration);
      console.log('📍 Scope:', registration.scope);
      console.log('🔄 State:', registration.active?.state);
      
      // Wait for service worker to be ready
      const readyRegistration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready:', readyRegistration);
      
      // Check if controlling page
      if (navigator.serviceWorker.controller) {
        console.log('✅ Service Worker is controlling the page');
      } else {
        console.log('⚠️ Service Worker is not controlling the page');
        console.log('💡 Try refreshing the page');
      }
      
    } else {
      console.error('❌ Service Worker file not found (404)');
    }
    
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
  
  // Check manifest
  try {
    const manifestResponse = await fetch('/manifest.json');
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      console.log('✅ Manifest loaded successfully');
      console.log('📋 Manifest:', manifest);
    } else {
      console.error('❌ Manifest file not found');
    }
  } catch (error) {
    console.error('❌ Manifest error:', error);
  }
}

// Run the debug test
debugServiceWorker();
