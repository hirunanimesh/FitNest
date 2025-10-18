// Utility for handling API calls with offline fallback
class OfflineAPIHandler {
  private cacheName = 'api-cache'
  
  async cachedFetch(url: string, options: RequestInit = {}) {
    const request = new Request(url, options)
    
    try {
      // Try network first
      const networkResponse = await fetch(request)
      
      if (networkResponse.ok) {
        // Cache successful responses
        const cache = await caches.open(this.cacheName)
        cache.put(request, networkResponse.clone())
        return networkResponse
      }
      
      throw new Error(`HTTP ${networkResponse.status}`)
    } catch (error) {
      console.log('Network failed, trying cache...', error)
      
      // Fallback to cache
      const cache = await caches.open(this.cacheName)
      const cachedResponse = await cache.match(request)
      
      if (cachedResponse) {
        console.log('Serving from cache:', url)
        return cachedResponse
      }
      
      throw new Error('No cached response available')
    }
  }
  
  async preloadAPI(endpoints: string[]) {
    const cache = await caches.open(this.cacheName)
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint)
        if (response.ok) {
          await cache.put(endpoint, response)
          console.log('Preloaded:', endpoint)
        }
      } catch (error) {
        console.log('Failed to preload:', endpoint, error)
      }
    }
  }
  
  async clearCache() {
    const cache = await caches.open(this.cacheName)
    const keys = await cache.keys()
    await Promise.all(keys.map(key => cache.delete(key)))
    console.log('API cache cleared')
  }
  
  async getCacheSize() {
    const cache = await caches.open(this.cacheName)
    const keys = await cache.keys()
    return keys.length
  }
}

export const offlineAPI = new OfflineAPIHandler()

// Enhanced fetch wrapper
export async function offlineFetch(url: string, options: RequestInit = {}) {
  return offlineAPI.cachedFetch(url, options)
}

// Preload critical API endpoints
export async function preloadCriticalData() {
  const criticalEndpoints = [
    '/api/user/profile',
    '/api/gym/list',
    '/api/trainer/list'
  ]
  
  await offlineAPI.preloadAPI(criticalEndpoints)
}