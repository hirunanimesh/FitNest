"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Dumbbell } from "lucide-react"
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter} from "next/navigation";
import { useAuth } from '@/contexts/AuthContext'
import { GetCustomerById } from '@/lib/api'

export function UserNavbar() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const router = useRouter();
  const { getUserProfileId } = useAuth();

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const customerId = await getUserProfileId();
        
        if (customerId) {
          const data = await GetCustomerById(customerId);
          const customerData = data.user;
          setImgUrl(customerData.profile_img);
        } else {
          setImgUrl(null);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    }

    fetchUserInfo();
  }, [getUserProfileId]);

  
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
