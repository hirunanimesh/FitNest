"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, ReactNode, useState } from 'react'
import { supabase } from "@/lib/supabase"

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
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // State for freshly fetched role; undefined=loading, null=none/not set
  const [freshRole, setFreshRole] = useState<string | null | undefined>(undefined)
  const [roleError, setRoleError] = useState<string | null>(null)

  const recentUserRole = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setRoleError(userError.message)
        return null
      }
      return user?.user_metadata?.role ?? null
    } catch (err: any) {
      console.error('Error determining role from auth metadata:', err)
      setRoleError(err.message || 'Role fetch failed')
      return null
    }
  }

  // Fetch role whenever auth user changes (and on mount when not loading)
  useEffect(() => {
    if (loading) return
    if (!user) {
      // Not logged in
      router.push('/auth/login')
      return
    }
    
    recentUserRole().then(r => setFreshRole(r))

  }, [loading, user])

  // Authorization / redirection effect once role resolved
  useEffect(() => {
    if (loading) return
    if (!user) return // already handled above
    if (freshRole === undefined){

      console.log('still loading role protected rout')
    }  // still loading role

    // If user has no role yet, you might send them to profile completion (optional)
    if (freshRole === null) {
      // Leave them or redirect: router.push('/auth/complete-profile')
      console.log('fresh role is null protected route')
      return
    }

    if (typeof freshRole === 'string' && !allowedRoles.includes(freshRole)) {
      console.log(`User role '${freshRole}' not in allowed roles for ${pathname}:`, allowedRoles)
      const defaultRedirectPath = redirectPath || getDashboardPath(freshRole)
      router.push(defaultRedirectPath)
    }
  }, [freshRole, loading, user, allowedRoles, redirectPath, router])

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
  if (user && freshRole === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (user && freshRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300">No role assigned yet.</p>
          {/* Optionally add a button to go to complete profile */}
        </div>
      </div>
    )
  }

  // Don't render content if user is not authenticated or authorized
  if (!user || typeof freshRole !== 'string' || !allowedRoles.includes(freshRole)) {
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
