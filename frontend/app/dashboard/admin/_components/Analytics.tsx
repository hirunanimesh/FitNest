import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Analytics = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Users (This Month)</span>
                      <span className="font-semibold">+2,345</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Gyms (This Month)</span>
                      <span className="font-semibold">+47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Trainers (This Month)</span>
                      <span className="font-semibold">+123</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue Growth</span>
                      <span className="font-semibold text-green-600">+15.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Subscriptions</span>
                      <span className="font-semibold">12,456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Session Duration</span>
                      <span className="font-semibold">24 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Satisfaction</span>
                      <span className="font-semibold">4.7/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Support Tickets</span>
                      <span className="font-semibold">23 open</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
    </div>
  )
}

export default Analytics
