"use client"
import React from 'react'
import { useSearchParams } from 'next/navigation'
import TopBar  from './_components/TopBar'
import { UserDataProvider } from './context/UserContext'


function Userlayout({ children }: { children: React.ReactNode }) {
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

export default  Userlayout