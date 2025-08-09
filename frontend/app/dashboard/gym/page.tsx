"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemberTab from "./_components/MemberTab";
import TrainerTab from "./_components/TrainerTab";
import PlansTab from "./_components/PlansTab";
import Statistics from "./_components/Statistics";

export default function GymDashboard() {
 
  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gym Dashboard</h1>
          <p className="text-muted-foreground">Manage your gym operations and monitor performance</p>
        </div>

        {/* Stats Overview */}
       <Statistics/>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="plans">Gym Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <MemberTab/>

          </TabsContent>

          <TabsContent value="trainers" className="space-y-6">
            <TrainerTab/>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <PlansTab/>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}