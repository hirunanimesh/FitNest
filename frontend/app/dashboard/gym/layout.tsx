import React from 'react'
import TopBar  from './_components/TopBar'

function Gymlayout({ children }: { children: React.ReactNode }) {
  return (
    <div>

        <TopBar/>
        
        <div>
            {children}
        </div>
      
    </div>
  )
}

export default  Gymlayout
