"use client"
//import { supabase } from "@/lib/supabase";
import React, { useState, useEffect } from "react";
import TopBar from "./_components/TopBar"
import Progress from "./_components/Progress"
import TodaySessions from "./_components/TodaySessions"
import UpcomingSessions from "./_components/UpcomingSessions"
import Charts from "./_components/Charts"
import Schedule from "./_components/Schedule"
import MotivationQuotes from "./_components/MotivationQuote"
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
//import {  GetUserInfo } from "@/lib/api"

function UserDashboardContent() {
  
  
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
    <ProtectedRoute allowedRoles={['customer']}>
      <Suspense fallback={<div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>}>
        <UserDashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
