"use client"

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { usePathname,useRouter} from "next/navigation";
import { Button } from "@/components/ui/button"
import { Dumbbell, Menu, X, LogOut, User, Search, Home } from "lucide-react"
import Link from "next/link"
import { useUserData } from '../context/UserContext'

export default function TopBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userData } = useUserData();
  const router = useRouter();
  const today = format(new Date(), "EEEE, MMMM do, yyyy");
  const pathname = usePathname();
  const userName = userData ? `${userData.firstName} ${userData.lastName}` : "User";
  const imgUrl = userData?.avatar || null;

// Check if current path matches the nav item
   const isActive = (href: string) => {
    const normalizedPathname = pathname.replace(/\/+$/, '');
    const normalizedHref = href.replace(/\/+$/, '');
    return normalizedPathname === normalizedHref;
  };


  const handleLogout = () => {
    supabase.auth.signOut();
    router.push("/auth/login");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };


  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md border-b border-red-500/30 shadow-2xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-18 items-center justify-between">
            {/* Left side - Logo and greeting */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#FB4141] to-red-600 rounded-lg group-hover:from-red-600 group-hover:to-[#FB4141] transition-all duration-300 shadow-lg">
                  <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="font-bold text-xl sm:text-2xl text-white tracking-tight">
                  Fit<span className="text-[#FB4141]">Nest</span>
                </span>
              </Link>
              
              {/* Greeting - Hidden on small mobile */}
              <div className="hidden xs:flex flex-col">
                <h1 className="text-sm sm:text-lg text-white font-semibold truncate max-w-32 sm:max-w-none">
                  Hi, {userName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">{today}</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/dashboard/user"
                className="text-white hover:text-[#FB4141] px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300 relative group"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FB4141] to-red-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              
              <Link
                href="/dashboard/user/search"
                className="text-white hover:text-[#FB4141] px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300 relative group"
              >
                Search
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FB4141] to-red-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
          
              <Link href="/dashboard/user/profile" className="group">
                <Avatar className="cursor-pointer ring-2 ring-transparent group-hover:ring-[#FB4141]/50 transition-all duration-300">
                  <AvatarImage src={imgUrl ?? undefined} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-white font-semibold">
                    {userName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <Button
                onClick={handleLogout}
                className="bg-gradient-to-r from-[#FB4141] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-2 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>

            {/* Mobile menu button and avatar */}
            <div className="flex lg:hidden items-center space-x-3">
              <Link href="/dashboard/user/profile" className="group">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer ring-2 ring-transparent group-hover:ring-[#FB4141]/50 transition-all duration-300">
                  <AvatarImage src={imgUrl ?? undefined} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-white font-semibold text-sm">
                    {userName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 text-white hover:from-[#FB4141] hover:to-red-600 transition-all duration-300 shadow-lg"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          
          {/* Right side - Navigation and user actions */}
          
            <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard/user"
              className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group ${
                isActive('/dashboard/trainer') 
                  ? 'text-red-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Dashboard
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-200 ${
                isActive('/dashboard/user') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>

              <Link
              href="/dashboard/user/search"
              className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group ${
                isActive('/dashboard/trainer') 
                  ? 'text-red-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Search
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-200 ${
                isActive('/dashboard/user/search') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <Link href="/dashboard/user/profile">
              <Avatar className="cursor-pointer">
                <AvatarImage src={imgUrl ?? undefined} />
                <AvatarFallback>{userName?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </Link>
            
            <Button
              onClick={() => {
                supabase.auth.signOut();
                router.push("/auth/login");
              }}
              className="bg-[#FB4141] hover:bg-[#e63636] text-white"
            >
              Logout
            </Button>
          </nav>

        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeMobileMenu}
            ></div>
            
            {/* Mobile Menu Panel */}
            <div className="absolute top-16 sm:top-18 right-0 w-72 sm:w-80 h-fit bg-gradient-to-b from-gray-900 via-black to-gray-900 border border-red-500/30 rounded-bl-2xl shadow-2xl">
              <div className="p-6">
                {/* Mobile User Info */}
                <div className="flex items-center space-x-4 pb-6 border-b border-gray-700/50">
                  <Avatar className="h-12 w-12 ring-2 ring-[#FB4141]/30">
                    <AvatarImage src={imgUrl ?? undefined} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-white font-semibold">
                      {userName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{userName}</h3>
                    <p className="text-gray-400 text-sm">{today}</p>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="py-6 space-y-2">
                  <Link
                    href="/dashboard/user"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl text-white hover:bg-gradient-to-r hover:from-[#FB4141]/20 hover:to-red-600/20 hover:text-[#FB4141] transition-all duration-300 group"
                  >
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/dashboard/user/search"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl text-white hover:bg-gradient-to-r hover:from-[#FB4141]/20 hover:to-red-600/20 hover:text-[#FB4141] transition-all duration-300 group"
                  >
                    <Search className="h-5 w-5" />
                    <span className="font-medium">Search</span>
                  </Link>
                  
                  <Link
                    href="/dashboard/user/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl text-white hover:bg-gradient-to-r hover:from-[#FB4141]/20 hover:to-red-600/20 hover:text-[#FB4141] transition-all duration-300 group"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                </nav>

                {/* Mobile Logout Button */}
                <div className="pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-[#FB4141] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 transition-all duration-300 shadow-lg"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16 sm:h-18"></div>
    </>
  )
}