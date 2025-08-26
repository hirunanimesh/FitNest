import React from 'react'
import TopBar  from './_components/TopBar'
import { GymProvider } from './context/GymContext'


function Gymlayout({ children }: { children: React.ReactNode }) {
  return (
    <GymProvider>
      <div>
          <TopBar/>
          <div>
              {children}
          </div>
      </div>
    </GymProvider>
  )
}

export default  Gymlayout
