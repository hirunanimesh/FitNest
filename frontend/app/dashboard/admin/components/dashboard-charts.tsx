"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users, Download } from "lucide-react"

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

  const handleDownloadMemberChart = () => {
    // PDF generation logic will be implemented here
    console.log("Download Member Growth Chart PDF")
  }

  const handleDownloadRevenueChart = () => {
    // PDF generation logic will be implemented here
    console.log("Download Revenue Chart PDF")
  }

  return (
    <div className="space-y-6">
      {/* Desktop View - Both Charts */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        {/* Member Growth Chart */}
        <div className="space-y-3">
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
          <button
            onClick={handleDownloadMemberChart}
            className="w-30 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        {/* Revenue Chart */}
        <div className="space-y-3">
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
          <button
            onClick={handleDownloadRevenueChart}
            className="w-30 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Mobile View - Buttons Only */}
      <div className="lg:hidden space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleDownloadMemberChart}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-6 rounded-lg flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-red-500" />
              <div className="text-left">
                <div className="font-semibold">Member Growth Chart</div>
                <div className="text-sm text-gray-400">Download PDF report</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-red-400" />
          </button>
          
          <button
            onClick={handleDownloadRevenueChart}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-6 rounded-lg flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-red-400" />
              <div className="text-left">
                <div className="font-semibold">Revenue Chart</div>
                <div className="text-sm text-gray-400">Download PDF report</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  )
}