import React from 'react'
import { AdminNavbar } from "@/components/admin-navbar"
import { ProtectedRoute } from "@/components/ProtectedRoute"

const Adminlayout = ({children}:{children:React.ReactNode}) => {
  return (
    <div>
      <ProtectedRoute allowedRoles={['admin']}>
      <AdminNavbar/>
      <div>
        {children}
      </div>
      </ProtectedRoute>
    </div>
  )
}

export default Adminlayout
