'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format } from "date-fns";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChartNoAxesCombinedIcon, Dumbbell, LayoutDashboard, Tv2, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockTrainer = {
  name: "John Doe",
  email: "john@fitnest.com",
};

const SideBar = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  // Navigation items configuration
  const navigationItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard/trainer',
    },
    {
      title: 'My Sessions/Plans',
      icon: Tv2,
      href: '/dashboard/trainer/plans',
    },
    {
      title: 'Analytics',
      icon: ChartNoAxesCombinedIcon,
      href: '/dashboard/trainer/analytics',
    },
  ];

  // Normalize pathname and href by removing trailing slashes
  const normalizePath = (path: string) => path.replace(/\/+$/, '');

  // Check if current path matches the nav item
  const isActive = (href: string) => {
    const normalizedPathname = normalizePath(pathname);
    const normalizedHref = normalizePath(href);
    
    // Exact match for all routes
    return normalizedPathname === normalizedHref;
  };

  return (
    <SidebarProvider>
      <Sidebar className="bg-gray-900 border-r border-gray-800">
        <SidebarHeader className="bg-transparent border-b border-gray-800">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/trainer/dashboard">
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-gray-800/50 text-white hover:bg-gray-800/50 transition-colors w-full">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-500/20 text-red-500">
                    <Dumbbell className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-bold text-white">FitNest</span>
                    <span className="text-xs text-gray-400">Trainer Dashboard</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        
        <SidebarContent className="bg-transparent">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2 px-3 py-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href} className="w-full">
                        <SidebarMenuButton 
                          className={`
                            w-full transition-all duration-200 p-3 rounded-lg group
                            ${active 
                              ? 'bg-gray-800 text-white border-l-4 border-red-500' 
                              : 'text-gray-300 hover:text-white hover:bg-gray-800'
                            }
                          `}
                        >
                          <span className='flex flex-row gap-3 items-center'>
                            <Icon className={`
                              w-5 h-5 transition-colors
                              ${active 
                                ? 'text-red-400' 
                                : 'text-red-500 group-hover:text-red-400'
                              }
                            `}/>
                            <span className="font-medium">{item.title}</span>
                          </span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="bg-transparent border-t border-gray-800 p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                className="text-gray-400 hover:text-red-400 hover:bg-gray-800/50 transition-all duration-200 p-3 rounded-lg group cursor-pointer w-full"
                onClick={() => {
                  console.log('Logout clicked');
                }}
              >
                <span className='flex flex-row gap-3 items-center'>
                  <LogOut className="w-5 h-5"/>
                  <span className="font-medium">Logout</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail className="bg-gray-800" />
      </Sidebar>
      
      <SidebarInset className="flex bg-gray-900 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center gap-2 border-b border-gray-800 px-4 bg-gray-800 text-white">
          <SidebarTrigger className="-ml-1 text-white hover:bg-gray-700 data-[state=open]:bg-gray-700" />
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Hi, {mockTrainer.name}</h1>
              <p className="text-sm text-gray-300">{today}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SideBar;