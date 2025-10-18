"use client"
import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import TopBar  from './_components/TopBar'
import { UserDataProvider } from './context/UserContext'

function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const isAdminView = searchParams.get('adminView') === 'true'
  
  return (
    <UserDataProvider>
      <div className="min-h-screen bg-black">
          {!isAdminView && <TopBar/>}
          <div className="bg-black">
              {children}
          </div>
      </div>
    </UserDataProvider>
  )
}

function Userlayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <UserLayoutContent>{children}</UserLayoutContent>
    </Suspense>
  )
}

export default Userlayout