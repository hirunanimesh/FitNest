import React from 'react'
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AdminNavbar } from './components/adminNavbar'

interface AdminLayoutProps {
  children: React.ReactNode
}

const Adminlayout = ({ children }: AdminLayoutProps) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-900">
        <AdminNavbar
          adminName="Admin User"
          adminAvatar="/admin-avatar.png"
          platformName="FitNest"
          pendingVerifications={5} // You can make this dynamic later
        />
        <main className="p-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default Adminlayout
