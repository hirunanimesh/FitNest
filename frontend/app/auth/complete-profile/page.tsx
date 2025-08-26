"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PublicRoute } from "@/components/PublicRoute"

export default function CompleteProfileRouter() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          router.push('/auth/login')
          return
        }

        const user = session.user
        
        // Check if user already has a profile
        const { data: customerData } = await supabase
          .from('customer')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (customerData) {
          router.push('/dashboard/user')
          return
        }

        // For OAuth users, default to customer profile completion
        router.push('/auth/complete-profile/user')
        
      } catch (error) {
        console.error('Error in profile router:', error)
        // Default to user profile completion
        router.push('/auth/complete-profile/user')
      } finally {
        setLoading(false)
      }
    }

    checkUserAndRedirect()
  }, [router])

  if (loading) {
    return (
      <PublicRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Redirecting...</p>
          </div>
        </div>
      </PublicRoute>
    )
  }

  return null
}
