import React from 'react'
import { TrainerDataProvider } from './context/TrainerContext'
import TopBar from './_components/Topbar'

const Trainerlayout = ({children}:{children:React.ReactNode}) => {
  return (
    <TrainerDataProvider >
      <div className="min-h-screen bg-gray-900">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </TrainerDataProvider>
  )
}

export default Trainerlayout