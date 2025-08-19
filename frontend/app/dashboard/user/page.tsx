"use client"
//import { supabase } from "@/lib/supabase";
import React, { useState, useEffect } from "react";
import TopBar from "./_components/TopBar"
import Progress from "./_components/Progress"
import TodaySessions from "./_components/TodaySessions"
import UpcomingSessions from "./_components/UpcomingSessions"
import KPI from "./_components/KPI"
import Charts from "./_components/Charts"
import Schedule from "./_components/Schedule"
import MotivationQuotes from "./_components/MotivationQuote"
import { Suspense } from "react";
//import {  GetUserInfo } from "@/lib/api"

function UserDashboardContent() {
  
   /*const [profileId, setProfileId] = useState<string | null>(null);
       const [customerId, setCustomerId] = useState<string | null>(null);
   
   useEffect(() => {
     async function fetchUserInfo() {
       const {
         data: { session },
       } = await supabase.auth.getSession();
       const token = session?.access_token;
       if (!token) return;
   
       try {
         const data = await GetUserInfo(token);
         const profileId = data?.user?.id || null;
         setProfileId(profileId);
   
         if (profileId) {
           // Fetch customer_id from customer table
           const { data: customerData, error } = await supabase
             .from("customer")
             .select("id")
             .eq("user_id", profileId)
             .single();
   
           if (error) {
             console.error("Error fetching customer id:", error);
             setCustomerId(null);
           } else {
             setCustomerId(customerData?.id);
           }
         }
       } catch (error) {
         console.error("Error fetching user info:", error);
         setProfileId(null);
         setCustomerId(null);
       }
     }
   
     fetchUserInfo();
   }, []);*/
  return (
    <div className="bg-black">
      {/* Header */}
       <TopBar />

      {/* Main Content */}
      <div className="flex-1 space-y-10 p-20">
        {/* Motivation Quote */}
        <MotivationQuotes />

        {/* Streak Card */}
        <Progress  />

        {/* Today's Sessions */}
        <TodaySessions  />

        {/* Upcoming Sessions */}
        <UpcomingSessions  />

        {/* KPI Results */}
        <KPI  />

        {/* Charts */}
        <Charts />
      </div>

      {/* Right Sidebar */}
      <Schedule  />
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
