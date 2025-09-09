import React from 'react'
import { TrainerDataProvider } from './context/TrainerContext'
import TopBar from './_components/Topbar'

const Trainerlayout = ({children}:{children:React.ReactNode}) => {
  return (
    <TrainerDataProvider >
      <div className="relative min-h-screen bg-gradient-to-b from-black via-slate-700 to-black">
        {/* centered black band behind content */}
        <div className="absolute leftple-0 right-0 top-1/2 -translate-y-1/2 h-48 bg-black z-10 pointer-events-none" />

        <div className="relative z-20">
          <div className="z-30">
            <TopBar />
          </div>
          <main className="container mx-auto px-4 py-6 relative z-20">
            {children}
          </main>
        </div>
      </div>
    </TrainerDataProvider>
  )
}

export default Trainerlayout