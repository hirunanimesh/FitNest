"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { GetUserInfo } from '@/lib/api'

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  userId: number | null  // User profile ID based on role
  loading: boolean
  signOut: () => Promise<void>
  refreshUserRole: () => Promise<void>
  getUserProfileId: () => Promise<number | null>  // Add function to get profile ID
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
  const [userId, setUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const getUserRole = async (user: User, session: Session) => {
    try {
       if (user.user_metadata?.role) {
        return user.user_metadata.role
      }
      // Check if they are a customer first
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
        .select('gym_id')  // Select gym primary key
        .eq('user_id', user.id)
        .single()

      if (gymData) {
        return 'gym'
      }

      // No role found
      return null
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  }

  // Separate function to get user profile ID (for loading user data)
  const getUserProfileId = async (): Promise<number | null> => {
    if (!user) return null

    try {
      // Based on userRole, fetch the appropriate ID
      if (userRole === 'customer') {
        const { data: customerData } = await supabase
          .from('customer')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        return customerData?.id || null
      }

      if (userRole === 'trainer') {
        const { data: trainerData } = await supabase
          .from('trainer')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        return trainerData?.id || null
      }

      if (userRole === 'gym') {
        const { data: gymData } = await supabase
          .from('gym')
          .select('gym_id')
          .eq('user_id', user.id)
          .single()
        
        return gymData?.gym_id || null
      }

      return null
    } catch (error) {
      console.error('Error getting user profile ID:', error)
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
          // We'll load the profile ID later when needed, not during login
          setUserId(null)
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
          // We'll load the profile ID later when needed, not during auth change
          setUserId(null)
        } else {
          setUserRole(null)
          setUserId(null)
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
    setUserId(null)
  }

  const refreshUserRole = async () => {
    if (user && session) {
      const role = await getUserRole(user, session)
      setUserRole(role)
      // Clear userId, it will be loaded when needed
      setUserId(null)
    }
  }

  const value = {
    user,
    session,
    userRole,
    userId,
    loading,
    signOut,
    refreshUserRole,
    getUserProfileId
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
