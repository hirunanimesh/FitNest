// Simple PWA without caching
// No caching mechanisms - just PWA installation capability

console.log('🎯 This PWA has NO caching enabled');
console.log('� PWA installation is available from browser menu');
console.log('� All data is always fresh from server');

// If you need to clear any existing caches from previous versions:
const clearAllCaches = async () => {
  try {
    console.log('🧹 Clearing all existing caches...');
    
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log(`✅ Deleted cache: ${cacheName}`);
    }
    
    console.log('🎉 All caches cleared!');
    window.location.reload();
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
};

// Uncomment to clear existing caches:
// clearAllCaches();