"use client"

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Dumbbell, LayoutDashboard, ChartNoAxesCombinedIcon, Tv2, User2, LogOut, Menu, X, MapPin } from "lucide-react"
import Link from "next/link"
import { useTrainerData } from '../context/TrainerContext'

export default function TopBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { trainerData } = useTrainerData();
  const router = useRouter();
  const pathname = usePathname();
  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  const trainerName = trainerData ? trainerData.trainer_name : "Trainer";
  const imgUrl = trainerData?.profile_img || null;

  // Check if current path matches the nav item
  const isActive = (href: string) => {
    if (!pathname) return false;
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
        <div className="container flex h-16 items-center justify-between px-2">
          {/* Left side - Logo, greeting, and date */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#FB4141] to-red-600 rounded-lg group-hover:from-red-600 group-hover:to-[#FB4141] transition-all duration-300 shadow-lg">
                <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="font-bold text-xl sm:text-2xl text-white tracking-tight">
                Fit<span className="text-[#FB4141]">Nest</span>
              </span>
            </Link>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-lg text-gray-400 font-semibold">
                Hi, {trainerName}
              </h1>
              <p className="text-sm text-gray-400">{today}</p>
            </div>
          </div>
          
          {/* Right side - Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard/trainer"
              className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group ${
                isActive('/dashboard/trainer')
                  ? 'text-red-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-200 ${
                isActive('/dashboard/trainer') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>

            <Link
              href="/dashboard/trainer/gyms"
              className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group ${
                isActive('/dashboard/trainer/gyms')
                  ? 'text-red-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Gyms
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-200 ${
                isActive('/dashboard/trainer/gyms') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>

            <Link
              href="/dashboard/trainer/plans"
              className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group ${
                isActive('/dashboard/trainer/plans')
                  ? 'text-red-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Tv2 className="h-4 w-4" />
              My Sessions
              <span className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-200 ${
                isActive('/dashboard/trainer/plans') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
        
            <Link href="/dashboard/trainer/profile">
              <Avatar className="cursor-pointer ring-2 ring-transparent hover:ring-red-500 transition-all duration-200">
                <AvatarImage src={imgUrl ?? undefined} />
                <AvatarFallback className="bg-red-500/20 text-red-500 flex items-center justify-center">
                  {trainerData?.trainer_name ? (
                    trainerData.trainer_name.split(' ').map(n => n[0]).join('').toUpperCase()
                  ) : (
                    <User2 className="h-4 w-4" />
                  )}
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-red-500" />
            ) : (
              <Menu className="h-6 w-6 text-red-500" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-r from-black via-gray-900 to-black border-t border-red-500/30 shadow-lg">
            <div className="container px-2 py-4 space-y-2">
              {/* Mobile greeting */}
              <div className="sm:hidden px-3 py-2 border-b border-gray-700/50 mb-2">
                <h1 className="text-lg text-gray-400 font-semibold">
                  Hi, {trainerName}
                </h1>
                <p className="text-sm text-gray-400">{today}</p>
              </div>

              {/* Dashboard Link */}
              <Link
                href="/dashboard/trainer"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                  isActive('/dashboard/trainer')
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>

              {/* Gyms Link */}
              <Link
                href="/dashboard/trainer/gyms"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                  isActive('/dashboard/trainer/gyms')
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <MapPin className="h-5 w-5" />
                Gyms
              </Link>

              {/* My Sessions Link */}
              <Link
                href="/dashboard/trainer/plans"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                  isActive('/dashboard/trainer/plans')
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Tv2 className="h-5 w-5" />
                My Sessions
              </Link>

              {/* Profile Link */}
              <Link
                href="/dashboard/trainer/profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={imgUrl ?? undefined} />
                  <AvatarFallback className="bg-red-500/20 text-red-500 flex items-center justify-center text-xs">
                    {trainerData?.trainer_name ? (
                      trainerData.trainer_name.split(' ').map(n => n[0]).join('').toUpperCase()
                    ) : (
                      <User2 className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                Profile
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-white hover:bg-red-500/20 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
      
      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  )
}