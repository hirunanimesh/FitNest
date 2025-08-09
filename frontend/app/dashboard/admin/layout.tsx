import React from 'react'
import { AdminNavbar } from "@/components/admin-navbar"

const Adminlayout = ({children}:{children:React.ReactNode}) => {
  return (
    <div>
      <AdminNavbar/>
      <div>
        {children}
      </div>
    </div>
  )
}

export default Adminlayout
