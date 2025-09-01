// PWA Installation Handler
console.log('🚀 PWA Install handler loaded');

let deferredPrompt = null;
let installButton = null;

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('🎯 beforeinstallprompt event triggered!');
  
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  
  // Save the event so it can be triggered later
  deferredPrompt = e;
  
  // Show custom install button
  showInstallButton();
  
  console.log('✅ Install prompt ready - user can now install PWA');
});

// Create and show install button
function showInstallButton() {
  // Remove existing button if any
  if (installButton) {
    installButton.remove();
  }
  
  // Create install button
  installButton = document.createElement('button');
  installButton.id = 'pwa-install-btn';
  installButton.innerHTML = '📱 Install FitNest App';
  installButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: #4CAF50;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  `;
  
  // Add hover effect
  installButton.addEventListener('mouseenter', () => {
    installButton.style.background = '#45a049';
    installButton.style.transform = 'scale(1.05)';
  });
  
  installButton.addEventListener('mouseleave', () => {
    installButton.style.background = '#4CAF50';
    installButton.style.transform = 'scale(1)';
  });
  
  // Add click handler
  installButton.addEventListener('click', installPWA);
  
  // Add to page
  document.body.appendChild(installButton);
  
  console.log('✅ Install button added to page');
}

// Install PWA function
async function installPWA() {
  if (!deferredPrompt) {
    console.log('❌ No install prompt available');
    alert('PWA installation not available. Please use your browser\'s install option.');
    return;
  }
  
  console.log('🔄 Showing install prompt...');
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`👤 User response: ${outcome}`);
  
  if (outcome === 'accepted') {
    console.log('✅ User accepted the install prompt');
    hideInstallButton();
  } else {
    console.log('❌ User dismissed the install prompt');
  }
  
  // Clear the deferredPrompt
  deferredPrompt = null;
}

// Hide install button
function hideInstallButton() {
  if (installButton) {
    installButton.style.opacity = '0';
    installButton.style.transform = 'scale(0.8)';
    setTimeout(() => {
      if (installButton) {
        installButton.remove();
        installButton = null;
      }
    }, 300);
  }
}

// Check if app is already installed
window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA was installed successfully!');
  hideInstallButton();
});

// Check installation status on load
window.addEventListener('load', () => {
  // Check if running as PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('📱 Running as installed PWA');
    return;
  }
  
  // Check if beforeinstallprompt is supported
  if ('serviceWorker' in navigator && 'beforeinstallprompt' in window) {
    console.log('✅ PWA installation supported');
  } else {
    console.log('❌ PWA installation not supported in this browser');
  }
  
  // Force check for installation criteria after a short delay
  setTimeout(checkInstallationCriteria, 2000);
});

// Manual check for installation criteria
async function checkInstallationCriteria() {
  console.log('🔍 Checking PWA installation criteria...');
  
  const criteria = {
    https: location.protocol === 'https:',
    serviceWorker: 'serviceWorker' in navigator,
    manifest: !!document.querySelector('link[rel="manifest"]'),
    swRegistered: false,
    swActive: false
  };
  
  // Check service worker registration
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      criteria.swRegistered = !!registration;
      criteria.swActive = !!(registration && registration.active);
    } catch (e) {
      console.log('❌ Error checking service worker:', e);
    }
  }
  
  console.log('📋 Installation criteria:', criteria);
  
  const allCriteriaMet = Object.values(criteria).every(Boolean);
  console.log(`🎯 All criteria met: ${allCriteriaMet ? '✅' : '❌'}`);
  
  if (allCriteriaMet && !deferredPrompt) {
    console.log('💡 All criteria met but no install prompt. This might be because:');
    console.log('   - App is already installed');
    console.log('   - Browser has dismissed prompt permanently');
    console.log('   - Browser doesn\'t support PWA installation');
    console.log('   - Need to wait for user interaction');
    
    // Show a manual install guide
    showManualInstallGuide();
  }
}

// Show manual installation guide
function showManualInstallGuide() {
  // Only show if no install button is already present
  if (installButton) return;
  
  const guideButton = document.createElement('button');
  guideButton.innerHTML = '💡 Install App Manually';
  guideButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: #2196F3;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  guideButton.addEventListener('click', () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    let message = 'To install this app:\n\n';
    
    if (isAndroid) {
      message += '📱 Android Chrome:\n';
      message += '1. Tap the menu (⋮) in the top right\n';
      message += '2. Select "Install app" or "Add to Home screen"\n';
      message += '3. Follow the prompts\n';
    } else if (isIOS) {
      message += '📱 iPhone Safari:\n';
      message += '1. Tap the Share button (⬆️)\n';
      message += '2. Scroll down and tap "Add to Home Screen"\n';
      message += '3. Tap "Add" in the top right\n';
    } else {
      message += '💻 Desktop Chrome:\n';
      message += '1. Click the install icon in the address bar\n';
      message += '2. Or go to Settings > Install FitNest\n';
      message += '3. Click "Install"\n';
    }
    
    alert(message);
    
    // Remove guide button after showing
    guideButton.remove();
  });
  
  document.body.appendChild(guideButton);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (guideButton.parentNode) {
      guideButton.remove();
    }
  }, 10000);
}

console.log('🎯 PWA Install handler ready');
