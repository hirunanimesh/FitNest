"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: string[]
  redirectPath?: string
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectPath 
}: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // If no user is logged in, redirect to login
    if (!user) {
      router.push('/auth/login')
      return
    }

    // If user has no role yet, redirect to complete profile
    if (userRole === null) {
      router.push('/auth/complete-profile')
      return
    }

    // Check if user's role is allowed for this route
    if (!allowedRoles.includes(userRole)) {
      // Redirect based on user's actual role
      const defaultRedirectPath = redirectPath || getDashboardPath(userRole)
      router.push(defaultRedirectPath)
      return
    }
  }, [user, userRole, loading, router, allowedRoles, redirectPath])

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

  // Show loading if user exists but role is still being determined
  if (user && userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Setting up your profile...</p>
        </div>
      </div>
    )
  }

  // Don't render content if user is not authenticated or authorized
  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return null
  }

  return <>{children}</>
}

const getDashboardPath = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/dashboard/admin'
    case 'trainer':
      return '/dashboard/trainer'
    case 'gym':
      return '/dashboard/gym'
    case 'customer':
    default:
      return '/dashboard/user'
  }
}
