"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react"

const memberData = [
  { month: "Jan", members: 1200, growth: 8.2 },
  { month: "Feb", members: 1450, growth: 20.8 },
  { month: "Mar", members: 1680, growth: 15.9 },
  { month: "Apr", members: 1920, growth: 14.3 },
  { month: "May", members: 2150, growth: 12.0 },
  { month: "Jun", members: 2380, growth: 10.7 },
  { month: "Jul", members: 2620, growth: 10.1 },
  { month: "Aug", members: 2847, growth: 8.7 },
]

const revenueData = [
  { month: "Jan", revenue: 28500, subscriptions: 1140, avgRevenue: 25 },
  { month: "Feb", revenue: 32100, subscriptions: 1284, avgRevenue: 25 },
  { month: "Mar", revenue: 35800, subscriptions: 1432, avgRevenue: 25 },
  { month: "Apr", revenue: 38900, subscriptions: 1556, avgRevenue: 25 },
  { month: "May", revenue: 41200, subscriptions: 1648, avgRevenue: 25 },
  { month: "Jun", revenue: 43800, subscriptions: 1752, avgRevenue: 25 },
  { month: "Jul", revenue: 45600, subscriptions: 1824, avgRevenue: 25 },
  { month: "Aug", revenue: 47892, subscriptions: 1924, avgRevenue: 25 },
]

const categoryData = [
  { category: "Premium", value: 45, revenue: 21500 },
  { category: "Standard", value: 35, revenue: 16800 },
  { category: "Basic", value: 20, revenue: 9592 },
]

export function DashboardCharts() {
  const currentGrowth = memberData[memberData.length - 1].growth
  const revenueGrowth = (
    ((revenueData[revenueData.length - 1].revenue - revenueData[revenueData.length - 2].revenue) /
      revenueData[revenueData.length - 2].revenue) *
    100
  ).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                Member Growth
              </CardTitle>
              <CardDescription className="text-gray-400">Total members over time</CardDescription>
            </div>
            <div className="flex items-center gap-1 text-sm">
              {currentGrowth > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={currentGrowth > 0 ? "text-red-500" : "text-red-400"}>{currentGrowth}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                members: {
                  label: "Members",
                  color: "#ef4444",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memberData}>
                  <defs>
                    <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="members"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fill="url(#memberGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-400" />
                Monthly Revenue
              </CardTitle>
              <CardDescription className="text-gray-400">Revenue generated each month</CardDescription>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className="text-red-400">+{revenueGrowth}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "#f87171",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="revenue"
                    fill="#f87171"
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

     
    </div>
  )
}
