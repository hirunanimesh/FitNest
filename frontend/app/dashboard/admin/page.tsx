"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Pending from "./_components/Pending"
import Feedback from "./_components/Feedback"
import Analytics from "./_components/Analytics"
import Statistics from "./_components/Statistics"

export default function AdminDashboard() {

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor the FitConnect platform</p>
        </div>

        {/* Stats Overview */}
        <Statistics/>

        <Tabs defaultValue="verifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verifications">Pending Verifications</TabsTrigger>
            <TabsTrigger value="feedback">User Feedback</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="verifications" className="space-y-6">
            <Pending/>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Feedback/>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Analytics/>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
