import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Activity } from 'lucide-react';

const Progress = () => {
  return (
    <div>
       <Card className='bg-black'>
              <CardHeader>
                <CardTitle className="flex items-center gap-5 text-white">
                  <TrendingUp className="h-5 w-5 text-white" />
                  Workout Progress
                </CardTitle>
                <CardDescription className='text-white'>Track your fitness journey milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-9 ">
                  <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg ">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p className="text-2xl font-bold text-blue-500">7 days</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Best Streak</p>
                      <p className="text-2xl font-bold text-green-500">21 days</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Goal Progress</p>
                      <p className="text-2xl font-bold text-purple-500">85%</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">85</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
    </div>
  )
}

export default Progress
