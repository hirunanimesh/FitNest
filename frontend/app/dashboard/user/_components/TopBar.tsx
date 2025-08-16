import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useRouter} from "next/navigation";
import { Button } from "@/components/ui/button"
import { Dumbbell } from "lucide-react"
import Link from "next/link"
import {  GetUserInfo } from "@/lib/api"

export default function  TopBar() {

  const [profileId, setProfileId] = useState<string | null>(null);
  const[userName,setUserName] = useState<string|null>(null);
  const[imgUrl,setImgUrl] = useState<string|null>(null);
  const router = useRouter();
  const today = format(new Date(), "EEEE, MMMM do, yyyy");

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
    <>
      <header className="fixed top-0 z-50 w-full bg-black shadow-lg border-b-2 border-[#FB4141]">
        <div className="container flex h-16 items-center justify-between px-2">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-[#FB4141] rounded-lg group-hover:bg-[#e63636] transition-colors">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">FitNest</span>
          </Link>
          <h1 className="text-lg text-white font-semibold text-black px-8">
              Hi, {userName}
            </h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#Workout Progress" className="text-white hover:text-red-400">
              Workout Progress
            </a>
            <a href="#Today's Sessions" className="text-white hover:text-red-400">
              Today's Sessions
            </a>
            <a href="#Upcoming Sessions" className="text-white hover:text-red-400">
              Upcoming Sessions
            </a>
            <a href="#Health Analytics" className="text-white hover:text-red-400">
              Health Analytics
            </a>
            <a href="#Fitness Schedule" className="text-white hover:text-red-400">
              Fitness Schedule
            </a>
          
            <Link
              href="/dashboard/user/search"
              className="text-white hover:text-[#FB4141] px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group"
            >
              Search
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FB4141] group-hover:w-full transition-all duration-200"></span>
            </Link>
        
            <Link href={profileId ? `/dashboard/user/profile` : "#"}>
              <Avatar className="cursor-pointer">
                <AvatarImage src={imgUrl ?? undefined} />
                <AvatarFallback>{userName?.[0] || "G"}</AvatarFallback>
              </Avatar>
            </Link>
            <Button
              onClick={() => {
                supabase.auth.signOut();
                router.push("/auth/login");
              }}
            >
              Logout
            </Button>
            </nav>
          </div>
      </header>
    </>
  )
};

