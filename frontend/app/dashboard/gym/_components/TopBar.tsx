"use client";
import React, { useState, useEffect } from 'react'
import { Building } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { GetUserInfo } from '@/lib/api';

const TopBar = () => {
  const { user, signOut } = useAuth();
  const [userInfo, setUserInfo] = useState<{ name: string; avatar?: string } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) return;

        const data = await GetUserInfo(token);
        const userMeta = data?.user?.user_metadata;
        
        setUserInfo({
          name: userMeta?.full_name || userMeta?.name || user?.email || 'User',
          avatar: userMeta?.avatar_url || userMeta?.picture || undefined
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Fallback to basic user info from auth context
        setUserInfo({
          name: user?.email || 'User',
          avatar: undefined
        });
      }
    };

    fetchUserInfo();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div>
      <header className="bg-gray-800">
            <div className="container mx-auto flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Building className="h-6 w-6" />
                    </div>
                    <div>
                    <h1 className="text-2xl text-white font-bold">FitNest Gym</h1>
                    <p className="text-sm text-gray-300">Gym Management Dashboard</p>
                    </div>
                </div>
                <div className='flex flex-row gap-5 items-center'>
                
                <Link href='/dashboard/gym/profile'>
                  <Avatar>
                    <AvatarImage src={userInfo?.avatar || "/placeholder.svg"} alt="User avatar" />
                    <AvatarFallback>{userInfo?.name && userInfo.name.length > 0 ? userInfo.name[0] : "?"}</AvatarFallback>
                  </Avatar>
                </Link>
                  <Button onClick={handleSignOut}>Log out</Button>
                </div>
            </div>
        </header>
    </div>
  )
}

export default TopBar
