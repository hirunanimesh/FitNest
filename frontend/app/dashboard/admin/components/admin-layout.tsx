import type React from "react"
import { AdminNavbar } from "./adminNavbar"

interface AdminLayoutProps {
  children: React.ReactNode
  adminName?: string
  adminAvatar?: string
  platformName?: string
  pendingVerifications?: number
}

export function AdminLayout({
  children,
  adminName,
  adminAvatar,
  platformName,
  pendingVerifications,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <AdminNavbar
        adminName={adminName}
        adminAvatar={adminAvatar}
        platformName={platformName}
        pendingVerifications={pendingVerifications}
      />
      <main className="p-6">{children}</main>
    </div>
  )
}
