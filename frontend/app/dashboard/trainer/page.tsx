"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Bell, CalendarIcon, Plus, Edit, Trash } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import Statistics from "./_components/Statistics";
import Plans from "./_components/Plans";
import CreatePlan from "./_components/CreatePlan";
import UploadContent from "./_components/UploadContent";


const mockTrainer = {
  name: "John Doe",
  email: "john@fitnest.com",
};

const TrainerDashboard = () => {
  const [mounted, setMounted] = useState(false);
  // Add content management functionality

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  return (
    <SidebarProvider>
      <Sidebar className="bg-gradient-to-br from-blue-600 via-blue-700 to-black">
        <SidebarHeader className="bg-transparent">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="text-white hover:bg-white/10">
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-white">Trainer Dashboard</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="bg-transparent">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-white hover:bg-white/10">
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-transparent">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-white hover:bg-white/10">
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="flex">
        <div className="flex-1">
          <header className="flex h-16 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Hi, {mockTrainer.name}</h1>
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-6">

             {/* display statistics */}
            <Statistics/>

            {/* trainer plans */}
            <Plans/>

            {/* create Plan */}
            <CreatePlan/>

            {/* Trainer Content */}
            <UploadContent/>

            <div>
              <h2 className="text-xl font-semibold mb-4">Calendar</h2>
              <CalendarUI className="rounded-md border border-border" />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default TrainerDashboard;
