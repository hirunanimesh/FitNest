"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, FileCheck, MessageSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminNavbarProps {
  adminName?: string
  adminAvatar?: string
  platformName?: string
  pendingVerifications?: number
}

export function AdminNavbar({
  adminName = "Admin User",
  adminAvatar = "/admin-avatar.png",
  platformName = "FitPlatform",
  pendingVerifications = 0,
}: AdminNavbarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard/admin", label: "Dashboard", icon: Building2 },
    { href: "/dashboard/admin/verifications", label: "Verifications", icon: FileCheck, badge: pendingVerifications },
    { href: "/dashboard/admin/inquiries", label: "User Inquiries", icon: MessageSquare },
  ]

  return (
    <nav className="bg-black border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Platform icon and name */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">{platformName}</span>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center gap-1 ml-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center gap-2 ${
                      isActive
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-1 bg-red-500 text-white">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right side - Admin info */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Welcome,</span>
          <span className="text-sm font-medium text-white">{adminName}</span>
          <Avatar className="w-8 h-8">
            <AvatarImage src={adminAvatar || "/placeholder.svg"} alt={adminName} />
            <AvatarFallback className="bg-red-600 text-white">
              {adminName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  )
}
