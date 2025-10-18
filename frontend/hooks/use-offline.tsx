import { useState, useEffect } from 'react'

interface UseOfflineOptions {
  onOnline?: () => void
  onOffline?: () => void
}

export function useOffline(options: UseOfflineOptions = {}) {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        options.onOnline?.()
        setWasOffline(false)
      }
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      options.onOffline?.()
    }

    // Set initial state
    setIsOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [options, wasOffline])

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline
  }
}