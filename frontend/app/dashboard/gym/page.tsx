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

import { useGym } from "./context/GymContext";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { GetGymProfileData } from "@/lib/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";


export default function GymDashboard() {

  const {setGymId,setUserId} = useGym()

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }
    return data.session?.user.id;
  };

  useEffect(()=>{
    const fetchGymId = async() =>{
      const user_id = await getSession()
     setUserId(user_id || null)
      try{
        const response = await GetGymProfileData(user_id)
        if(response){
          console.log(response.gym)
          setGymId(response.gym.gym_id)
        }else{
          console.error("No response fetch")
        }
      }catch(error){
        console.log("Error fetching data",error)
      }
    }
    fetchGymId()
  },[setGymId,setUserId])
 
  return (
    <ProtectedRoute allowedRoles={['gym']}>
      <div className="min-h-screen bg-gray-900">
      
      <div className="container mx-auto p-6">

        {/* Stats Overview */}
       <Statistics/>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full bg-gray-700 text-white grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-12 sm:mb-16 md:mb-10 gap-1">
            <TabsTrigger value="analytics" className="text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900">Analytics</TabsTrigger>
            <TabsTrigger value="members" className="text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900">Members</TabsTrigger>
            <TabsTrigger value="trainers" className="text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900">Trainers</TabsTrigger>
            <TabsTrigger value="plans" className="text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900">Gym Plans</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="grid grid-cols md:grid-cols-2 space-y-10 md:space-y-0 gap-5 pt-4">
            <MonthlyRevenueChart/>
            <MonthlyMemberCountChart/>
          </TabsContent>

          <TabsContent value="members" className="space-y-6 pt-4">
            <MemberTab/>

          </TabsContent>

          <TabsContent value="trainers" className="space-y-6 pt-4">
            <TrainerTab/>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6 pt-4">
            <PlansTab/>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6 pt-4">
            <PaymentHistory/>
          </TabsContent>
        </Tabs>

      </div>
    </div>
    </ProtectedRoute>
  );
}