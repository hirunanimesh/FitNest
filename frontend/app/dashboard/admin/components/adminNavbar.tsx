"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, FileCheck, MessageSquare, Users, LogOut, Menu, X, FileText } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { GetTrainerVerifications, getGymVerifications } from "@/api/admin/route"

interface AdminNavbarProps {
  adminName?: string
  adminAvatar?: string
  platformName?: string
}

export function AdminNavbar({
  adminName = "Admin User",
  adminAvatar = "/admin-avatar.png",
  platformName = "FitPlatform",
}: AdminNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [pendingVerifications, setPendingVerifications] = useState(0)

  // Fetch pending verifications count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const [gymResponse, trainerResponse] = await Promise.all([
          getGymVerifications(),
          GetTrainerVerifications()
        ])

        let pendingCount = 0

        if (gymResponse.data.success) {
          const pendingGym = gymResponse.data.data.filter((gym: any) => 
            gym.status.toLowerCase() === "pending"
          ).length
          pendingCount += pendingGym
        }

        if (trainerResponse.data.success) {
          const pendingTrainer = trainerResponse.data.data.filter((trainer: any) => 
            trainer.status.toLowerCase() === "pending"
          ).length
          pendingCount += pendingTrainer
        }

        setPendingVerifications(pendingCount)
      } catch (error) {
        console.error("Error fetching pending verifications:", error)
        setPendingVerifications(0)
      }
    }

    fetchPendingCount()
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    supabase.auth.signOut();
    router.push("/auth/login");
  };

  const navItems = [
    { href: "/dashboard/admin", label: "Dashboard", icon: Building2 },
    { href: "/dashboard/admin/verifications", label: "Verifications", icon: FileCheck, badge: pendingVerifications },
    { href: "/dashboard/admin/inquiries", label: "User Inquiries", icon: MessageSquare },
    { href: "/dashboard/admin/trainers-gyms", label: "Trainers/Gyms", icon: Users },
    { href: "/dashboard/admin/documents", label: "Documents", icon: FileText },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <nav className="bg-black border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Platform icon and name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">{platformName}</span>
              <span className="text-lg font-bold text-white sm:hidden">FP</span>
            </div>

            {/* Desktop Navigation tabs */}
            <div className="hidden lg:flex items-center gap-1 ml-8">
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

          {/* Right side - Admin info and controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop admin info */}
            <div className="hidden md:flex items-center gap-3">
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

            {/* Mobile admin avatar only */}
            <div className="md:hidden">
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

            {/* Desktop logout button */}
            <Button
              onClick={handleLogout}
              className="hidden sm:flex bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-4 py-2 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden lg:block">Logout</span>
              <span className="lg:hidden">Out</span>
            </Button>

            {/* Mobile menu button */}
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              className="lg:hidden text-white hover:bg-gray-800 p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black border-b border-gray-800">
          <div className="px-4 py-3 space-y-2">
            {/* Mobile admin info */}
            <div className="md:hidden flex items-center gap-3 py-2 border-b border-gray-800">
              <Avatar className="w-10 h-10">
                <AvatarImage src={adminAvatar || "/placeholder.svg"} alt={adminName} />
                <AvatarFallback className="bg-red-600 text-white">
                  {adminName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-400">Welcome,</p>
                <p className="text-sm font-medium text-white">{adminName}</p>
              </div>
            </div>

            {/* Mobile navigation items */}
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start flex items-center gap-3 py-3 ${
                      isActive
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="bg-red-500 text-white">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )
            })}

            {/* Mobile logout button */}
            <div className="pt-2 border-t border-gray-800">
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}