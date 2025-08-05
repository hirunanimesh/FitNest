"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, User, Settings, Dumbbell } from "lucide-react"
import Link from "next/link"

export function UserNavbar() {
  // Mock user data
  const user = {
    name: "John Doe",
    email: "john@example.com",
    bmi: 24.2,
    avatar: "/placeholder.svg?height=32&width=32",
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">FitNest</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
            HOME
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            ABOUT
          </Link>
          <Link href="/trainers" className="text-sm font-medium hover:text-primary">
            TRAINERS
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">
            CONTACT
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {/* BMI Badge */}
          <Badge variant="secondary" className="hidden md:flex">
            BMI: {user.bmi}
          </Badge>

          {/* User Menu */}
          <div className="relative group">
            {/* Profile Icon - Click to navigate to profile */}
            <Link href="/profile">
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </Link>

            {/* Dropdown Menu - Shows on hover */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-black">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-black">{user.name}</p>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-sm text-black hover:bg-accent transition-colors"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-3 py-2 text-sm text-black hover:bg-accent transition-colors"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <div className="border-t border-black my-1"></div>
                <button className="flex items-center w-full px-3 py-2 text-sm text-black hover:bg-accent transition-colors">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
