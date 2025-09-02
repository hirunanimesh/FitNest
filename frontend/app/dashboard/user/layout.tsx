import React from 'react'
import TopBar  from './_components/TopBar'
import { UserDataProvider } from './context/UserContext'


function Userlayout({ children }: { children: React.ReactNode }) {
  return (
    <UserDataProvider>
      <div>
          <TopBar/>
          <div>
              {children}
          </div>
      </div>
    </UserDataProvider>
  )
}

export default  Userlayout