'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-slate-800 rounded-lg p-8 shadow-2xl">
          <div className="mb-6">
            {isOnline ? (
              <Wifi className="h-16 w-16 text-green-500 mx-auto" />
            ) : (
              <WifiOff className="h-16 w-16 text-red-500 mx-auto" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
          </h1>
          
          <p className="text-slate-300 mb-6">
            {isOnline 
              ? 'Your internet connection has been restored. You can now access all features.' 
              : 'It looks like you\'re not connected to the internet. Some features may be limited.'
            }
          </p>

          <div className="space-y-4">
            <Button 
              onClick={handleRetry}
              disabled={!isOnline}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isOnline ? 'Reload Page' : 'Waiting for Connection...'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Go Back
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-300">
              <strong>Offline Features Available:</strong>
            </p>
            <ul className="text-sm text-slate-400 mt-2 space-y-1">
              <li>• View cached gym information</li>
              <li>• Access previously loaded profiles</li>
              <li>• Browse saved workout plans</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}