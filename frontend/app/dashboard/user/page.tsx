"use client"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

import TopBar from "./_components/TopBar"
import Progress from "./_components/Progress"
import TodaySessions from "./_components/TodaySessions"
import UpcomingSessions from "./_components/UpcomingSessions"
import KPI from "./_components/KPI"
import Charts from "./_components/Charts"
import Schedule from "./_components/Schedule"
import { ThemeProvider } from 'next-themes';
import MotivationQuotes from "./_components/MotivationQuote"




// Define or import the missing types
interface User {
  id: number;
  name: string;
  avatar?: string;
}

export default function UserDashboard() {
  
  

  return (
     <ThemeProvider attribute="class" defaultTheme="system">
    <SidebarProvider>

  

      <SidebarInset className="flex text-red">
        <div className="flex-1">
          {/* Header */}
          <TopBar/>

          {/* Main Content */}
          <div className="flex-1 space-y-6 p-6">
            {/* Motivation Quote */}
            
                <MotivationQuotes />
              

            {/* Streak Card */}
            <Progress/>

            {/* Today's Sessions */}
            <TodaySessions/>

            {/* Upcoming Sessions */}
            <UpcomingSessions/>

            {/* KPI Results */}
              <KPI/>

            {/* Charts */}
            <Charts/>
          </div>
        </div>

        {/* Right Sidebar */}
        <Schedule/>

      </SidebarInset>
    </SidebarProvider>
    </ThemeProvider>
  );
}