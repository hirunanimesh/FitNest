"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { GetUserInfo } from '@/lib/api'

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUserRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const getUserRole = async (user: User, session: Session) => {
    try {
      // First check user metadata for role (for OAuth users)
      if (user.user_metadata?.role) {
        return user.user_metadata.role
      }

      // For regular users, check if they have customer profile
      const { data: customerData } = await supabase
        .from('customer')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (customerData) {
        return 'customer'
      }

      // Check if they are a trainer
      const { data: trainerData } = await supabase
        .from('trainer')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (trainerData) {
        return 'trainer'
      }

      // Check if they are a gym
      const { data: gymData } = await supabase
        .from('gym')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (gymData) {
        return 'gym'
      }

      // If no role found but user exists, they might be in OAuth flow
      // Return null to handle this case in the UI
      return null
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const role = await getUserRole(session.user, session)
          setUserRole(role)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const role = await getUserRole(session.user, session)
          setUserRole(role)
        } else {
          setUserRole(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserRole(null)
  }

  const refreshUserRole = async () => {
    if (user && session) {
      const role = await getUserRole(user, session)
      setUserRole(role)
    }
  }

  const value = {
    user,
    session,
    userRole,
    loading,
    signOut,
    refreshUserRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
