"use client";
import React from 'react'
import { Building, Sun } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TopBar = () => {
  const [user, setUser] = useState<{ name: string; avatar?: string } | null>(null);


  return (
    <div>
      <header className=" bg-gray-800">
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
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user ? user.name?.[0] : "?"}</AvatarFallback>
                  </Avatar>
                </Link>
                  <Button>Log out</Button>
                </div>
            </div>
        </header>
    </div>
  )
}

export default TopBar
