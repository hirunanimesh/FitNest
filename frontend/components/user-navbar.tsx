"use client"
import { supabase } from "@/lib/supabase";
import React, { useState, useEffect } from "react";
import { useRouter} from "next/navigation";
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {  Dumbbell } from "lucide-react"
import Link from "next/link"
import {  GetUserInfo } from "@/lib/api"

export function UserNavbar() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const[userName,setUserName] = useState<string|null>(null);
  const[imgUrl,setImgUrl] = useState<string|null>(null);
  
  useEffect(() => {
      async function fetchUserInfo() {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;
  
        try {
          const data = await GetUserInfo(token);
          const userMeta = data?.user?.user_metadata;
          setUserName(userMeta?.full_name || userMeta?.name || null);
          setImgUrl(userMeta?.avatar_url || userMeta?.picture || null);
          setProfileId(data?.user?.id || null);
        } catch (error) {
          setUserName(null);
          setImgUrl(null);
          setProfileId(null);
        }
      }
      fetchUserInfo();
    }, []);
  
  return (
    <header className="fixed top-0 z-50 w-full bg-black shadow-lg border-b-2 border-[#FB4141]">
      <div className="container flex h-16 items-center justify-between px-10">
        <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-[#FB4141] rounded-lg group-hover:bg-[#e63636] transition-colors">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">FitNest</span>
          </Link>
        <div className="flex-1" />
        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/dashboard/user" className="text-sm font-medium hover:text-primary">
            DASHBOARD
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            ABOUT
          </Link>
          <Link href="/dashboard/user/search" className="text-sm font-medium hover:text-primary">
            SEARCH
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary">
            CONTACT
          </Link>
        </nav>
<div className="flex-1" />
          <div className="flex items-center space-x-4 ml-auto">
           
                <Avatar className="cursor-pointer">
                  <AvatarImage src={imgUrl ?? undefined} />
                  <AvatarFallback>{userName?.[0] || "G"}</AvatarFallback>
                  </Avatar>
             
            <Button
              onClick={() => {
                supabase.auth.signOut();
                router.push("/auth/login");
              }}
            >
              Logout
            </Button>
        </div>
      </div>
    </header>
  )
}
