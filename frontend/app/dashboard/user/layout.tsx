"use client"
import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import TopBar  from './_components/TopBar'
import { UserDataProvider } from './context/UserContext'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  
  return (
    <UserDataProvider>
      <div className="min-h-screen bg-black">
          { <TopBar/>}
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
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  )
}

export default  Userlayout