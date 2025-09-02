"use client"

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { usePathname,useRouter} from "next/navigation";
import { Button } from "@/components/ui/button"
import { Dumbbell } from "lucide-react"
import Link from "next/link"
import { useUserData } from '../context/UserContext'

export default function  TopBar() {
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
  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-black shadow-lg border-b-2 border-[#FB4141]">
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
              <h1 className="text-lg text-white font-semibold">
                Hi, {userName}
              </h1>
              <p className="text-sm text-gray-400">{today}</p>
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
      </header>
    </>
  )
}

