import React from 'react'
import { Building } from 'lucide-react';

const TopBar = () => {
  return (
    <div>
      <header className="border-b bg-background">
            <div className="container mx-auto flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Building className="h-6 w-6" />
                    </div>
                    <div>
                    <h1 className="text-2xl font-bold">FitNest Gym</h1>
                    <p className="text-sm text-muted-foreground">Gym Management Dashboard</p>
                    </div>
                </div>
            </div>
        </header>
    </div>
  )
}

export default TopBar
