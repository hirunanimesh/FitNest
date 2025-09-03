import React from 'react'
import TopBar  from './_components/TopBar'
import { UserDataProvider } from './context/UserContext'


function Userlayout({ children }: { children: React.ReactNode }) {
  return (
    <UserDataProvider>
      <div className="min-h-screen bg-black">
          <TopBar/>
          <div className="bg-black">
              {children}
          </div>
      </div>
    </UserDataProvider>
  )
}

export default  Userlayout