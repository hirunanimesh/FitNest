"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Building, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react"
import { AdminNavbar } from "@/components/admin-navbar"

export default function AdminDashboard() {
  // Mock data
  const stats = {
    totalUsers: 50234,
    totalGyms: 1247,
    totalTrainers: 3456,
    totalRevenue: 2456789,
    pendingVerifications: 23,
  }

  const pendingVerifications = [
    {
      id: 1,
      name: "FitZone Premium",
      type: "Gym",
      owner: "John Smith",
      submittedDate: "2024-01-15",
      documents: 5,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      type: "Trainer",
      specialization: "Weight Loss",
      submittedDate: "2024-01-14",
      documents: 3,
    },
  ]

  const recentFeedback = [
    {
      id: 1,
      user: "Mike Chen",
      rating: 5,
      comment: "Great platform! Found an amazing trainer.",
      date: "2024-01-15",
      type: "Positive",
    },
    {
      id: 2,
      user: "Emily Rodriguez",
      rating: 2,
      comment: "Had issues with gym booking system.",
      date: "2024-01-14",
      type: "Issue",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor the FitConnect platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Gyms</p>
                  <p className="text-2xl font-bold">{stats.totalGyms.toLocaleString()}</p>
                </div>
                <Building className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Trainers</p>
                  <p className="text-2xl font-bold">{stats.totalTrainers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verifications">Pending Verifications</TabsTrigger>
            <TabsTrigger value="feedback">User Feedback</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="verifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
                <CardDescription>Review and approve gym and trainer applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingVerifications.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{item.type === "Gym" ? "🏋️" : "👨‍💼"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.type} • {item.type === "Gym" ? `Owner: ${item.owner}` : item.specialization}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {item.submittedDate} • {item.documents} documents
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Feedback</CardTitle>
                <CardDescription>Monitor user satisfaction and address concerns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{feedback.user[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{feedback.user}</p>
                            <p className="text-xs text-muted-foreground">{feedback.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={feedback.type === "Positive" ? "default" : "destructive"}>
                            {feedback.type}
                          </Badge>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < feedback.rating ? "text-yellow-400" : "text-gray-300"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{feedback.comment}</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View User Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          Respond
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
