"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemberTab from "./_components/MemberTab";
import TrainerTab from "./_components/TrainerTab";
import PlansTab from "./_components/PlansTab";
import Statistics from "./_components/Statistics";
import { Button } from "@/components/ui/button";
import MonthlyRevenueChart from "./_components/MonthlyRevenueChart";
import MonthlyMemberCountChart from "./_components/MonthlyMemberCountChart";
import PaymentHistory from "./_components/PaymentHistory";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function GymDashboard() {
 
  return (
    <ProtectedRoute allowedRoles={['gym']}>
      <div className="min-h-screen bg-gray-900">
      
      <div className="container mx-auto p-6">

        {/* Stats Overview */}
       <Statistics/>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full bg-gray-700 text-white grid-cols-5 mb-5">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="plans">Gym Plans</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="grid grid-cols md:grid-cols-2 space-y-10 md:space-y-0 gap-5">
            <MonthlyRevenueChart/>
            <MonthlyMemberCountChart/>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MemberTab/>

          </TabsContent>

          <TabsContent value="trainers" className="space-y-6">
            <TrainerTab/>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <PlansTab/>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentHistory/>
          </TabsContent>
        </Tabs>

      </div>
    </div>
    </ProtectedRoute>
  );
}