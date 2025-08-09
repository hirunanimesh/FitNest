import React from 'react'
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Sun, Moon, Bell } from 'lucide-react';
import { supabase } from "@/lib/supabase"
import axios from "axios"
import { format } from "date-fns"

interface User {
    id: number;
    name: string;
    avatar?: string;
  }
  interface Session {
    id: number;
    title: string;
    trainer: string;
    date: string;
    time: string;
    amount: string;
    description: string;
    image?: string;
  }
  
const TopBar = () => {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAndSessions = async () => {
          try {
            const userResponse = await axios.get<User>(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/customer`);
            setUser(userResponse.data);
    
            const sessionsResponse = await axios.get<Session[]>(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/gym/subscribe`, {
              params: { userId: userResponse.data.id },
            });
            setSessions(sessionsResponse.data);
    
            setLoading(false);
          } catch (err) {
            console.error("Error fetching data:", err);
            setLoading(false);
          }
        };
    
        fetchUserAndSessions();
      }, []);

      const today = format(new Date(), "EEEE, MMMM do, yyyy");

  return (
    <div>
       <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Hi, {user?.name}</h1>
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Avatar>
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <Button onClick={() => {
                  supabase.auth.signOut();
                  router.push('/auth/login');
                }}>
                  Logout
                </Button>
              </div>
            </div>
          </header>
    </div>
  )
}

export default TopBar
