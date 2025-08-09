import React from 'react'
import {Sidebar,SidebarContent,SidebarFooter,SidebarGroup,SidebarGroupContent,SidebarHeader,SidebarInset,SidebarMenu,SidebarMenuButton,SidebarMenuItem,SidebarProvider,SidebarRail,SidebarTrigger,} from "@/components/ui/sidebar"
import { Dumbbell, LogOut } from "lucide-react"
import { Home, User, Users, Phone } from "lucide-react"
const sidebarItems = [
    { title: "Home", icon: Home, url: "/", isActive: true },
    { title: "Profile", icon: User, url: "user/profile/1" },
    { title: "Search", icon: Users, url: "user/search" },
    { title: "Contacts", icon: Phone, url: "#" }
  ]

const SideBar = () => {
  return (
    <div>
      <Sidebar className="bg-gradient-to-br from-red-600 via-red-700 to-black dark:from-red-600 dark:via-red-700 dark:to-black">
      <SidebarHeader className="bg-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-white/10 text-white hover:bg-white/10 text-xl">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white/20 text-white-xl">
                <Dumbbell className="size-9" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-white">FitNest</span>
                <span className="text-xs text-white/80">Fitness Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive} className="text-lg">
                    <a href={item.url} className={`text-white hover:bg-white/10 ${item.isActive ? "bg-white/20 text-white font-semibold" : ""}`}>
                      <item.icon className="text-white" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-white hover:bg-white/10">
              <LogOut className="text-white" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    </div>
  )
}

export default SideBar
