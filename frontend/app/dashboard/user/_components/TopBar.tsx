import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useRouter} from "next/navigation";
import { Button } from "@/components/ui/button"
import { Dumbbell } from "lucide-react"
import Link from "next/link"
import { useAuth } from '@/contexts/AuthContext'
import { GetCustomerById } from '@/lib/api'

export default function  TopBar() {

  const [userName, setUserName] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const router = useRouter();
  const today = format(new Date(), "EEEE, MMMM do, yyyy");
  const { getUserProfileId } = useAuth();

useEffect(() => {
    async function fetchUserInfo() {
      try {
        const customerId = await getUserProfileId();
        
        if (customerId) {
          const data = await GetCustomerById(customerId);
          const customerData = data.user;
          
          const fullName = customerData?.first_name && customerData?.last_name 
            ? `${customerData.first_name} ${customerData.last_name}` 
            : customerData?.first_name || customerData?.last_name || null;
          setUserName(fullName);
          //console.log(customerData);
          setImgUrl(customerData.profile_img);
        } else {
          // If no customer ID, show default
          setUserName('User');
          setImgUrl(null);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
        
      }
    }

    fetchUserInfo();
  }, [getUserProfileId]);


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
              href="/dashboard/user/search"
              className="text-white hover:text-[#FB4141] px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group"
            >
              Search
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FB4141] group-hover:w-full transition-all duration-200"></span>
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
};

