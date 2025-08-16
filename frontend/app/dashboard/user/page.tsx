"use client"
import TopBar from "./_components/TopBar"
import Progress from "./_components/Progress"
import TodaySessions from "./_components/TodaySessions"
import UpcomingSessions from "./_components/UpcomingSessions"
import KPI from "./_components/KPI"
import Charts from "./_components/Charts"
import Schedule from "./_components/Schedule"
import MotivationQuotes from "./_components/MotivationQuote"

export default function UserDashboard() {
  
  // You can pass userId to other components as needed
  return (
    <div className="bg-black">
      {/* Header */}
      <TopBar  />

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