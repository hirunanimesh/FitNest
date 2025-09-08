"use client"

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Dumbbell, LayoutDashboard, ChartNoAxesCombinedIcon, Tv2, User2 } from "lucide-react"
import Link from "next/link"
import { useTrainerData } from '../context/TrainerContext'

export default function TopBar() {
  const { trainerData } = useTrainerData();
  const router = useRouter();
  const pathname = usePathname();
  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  const trainerName = trainerData ? trainerData.trainer_name : "Trainer";
  const imgUrl = trainerData?.profile_img || null;

  // Check if current path matches the nav item
  const isActive = (href: string) => {
    const normalizedPathname = pathname.replace(/\/+$/, '');
    const normalizedHref = href.replace(/\/+$/, '');
    return normalizedPathname === normalizedHref;
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-gray-900 shadow-lg border-b-2 border-gray-800">
        <div className="container flex h-16 items-center justify-between px-2">
          {/* Left side - Logo, greeting, and date */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-[#FB4141] rounded-lg group-hover:bg-[#e63636] transition-colors">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-white">FitNest</span>
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg text-gray-400 font-semibold">
                Hi, {trainerName}
              </h1>
              <p className="text-sm text-gray-400">{today}</p>
            </div>
          </div>
          
          {/* Right side - Navigation and user actions */}
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
              onClick={() => {
                supabase.auth.signOut();
                router.push("/auth/login");
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Logout
            </Button>
          </nav>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </>
  )
}
