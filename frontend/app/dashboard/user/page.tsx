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
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UserDashboardContent() {
   const searchParams = useSearchParams();
   const id = searchParams.get("id");
  return (
     <div className="bg-black">
    
          {/* Header */}
          <TopBar id={id}/>

          {/* Main Content */}
          <div className="flex-1 space-y-10 p-20">
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
        

        {/* Right Sidebar */}
        <Schedule/>

      
    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>}>
      <UserDashboardContent />
    </Suspense>
  );
}
