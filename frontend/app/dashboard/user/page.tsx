"use client"
//import { supabase } from "@/lib/supabase";
import React, { useState, useEffect } from "react";
import Progress from "./_components/Progress"

import UpcomingSessions from "./_components/UpcomingSessions"
import Charts from "./_components/Charts"
import Schedule from "../../../components/calendar/Calendar"
import MotivationQuotes from "./_components/MotivationQuote"
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import GymSubscriptions from "./_components/GymSubscriptions";

//import {  GetUserInfo } from "@/lib/api"

function UserDashboardContent() {
  
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-gray-900">
      {/* Desktop Layout */}
      <div className="hidden lg:block lg:min-h-screen">
        {/* Main Content */}
        <div className="space-y-10 p-6 xl:p-20">
          {/* Motivation Quote */}
          <MotivationQuotes />

          {/* Streak Card */}
          <Progress />

          {/* Today's Sessions */}
          {/* <TodaySessions /> */}

          {/* Upcoming Sessions */}
          <UpcomingSessions />

          <GymSubscriptions />

          {/* Charts */}
          <Charts />

          {/* Schedule - At bottom for desktop too */}
          <Schedule />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen">
        <div className="space-y-6 p-4 sm:p-6 pb-20">
          {/* Motivation Quote */}
          {/* <MotivationQuotes /> */}

          {/* Streak Card */}
          <Progress />

          {/* Today's Sessions */}
          {/* <TodaySessions /> */}

          {/* Upcoming Sessions */}
          <UpcomingSessions />

          <GymSubscriptions />

          {/* Charts */}
          <Charts />

          {/* Schedule - Last on Mobile */}
          <Schedule />
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-gray-900 py-16">
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg sm:text-xl">Loading...</div>
          </div>
        </div>
      }>
        <UserDashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}