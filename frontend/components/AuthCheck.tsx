"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface AuthCheckProps {
  children: ReactNode
}

export const AuthCheck = ({ children }: AuthCheckProps) => {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // If user is logged in but has no role, they need to complete profile
    if (user && userRole === null) {
      router.push('/auth/complete-profile')
      return
    }
  }, [user, userRole, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
