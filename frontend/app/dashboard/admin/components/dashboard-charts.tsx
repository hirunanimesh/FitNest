"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users, Download, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MemberGrowth } from "@/api/admin/route"
import { transformMemberData, getDefaultDateRange, ChartMemberData, BackendMemberData } from "@/lib/chartUtils"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  // State for member data and UI
  const [memberData, setMemberData] = useState<ChartMemberData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange())
  const [showDatePicker, setShowDatePicker] = useState(false)
  // Fetch member growth data
  const fetchMemberData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await MemberGrowth(dateRange.startDate, dateRange.endDate)
      
      if (response.data?.success && response.data?.data) {
        const transformedData = transformMemberData(response.data.data)
        setMemberData(transformedData)
      } else {
        throw new Error(response.data?.message || "Failed to fetch member data")
      }
    } catch (err) {
      console.error("Error fetching member data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch member data")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on component mount and when date range changes
  useEffect(() => {
    fetchMemberData()
  }, [dateRange.startDate, dateRange.endDate])

  // Handle date range changes
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate })
  }

  // Calculate current growth from real data
  const currentGrowth = memberData.length > 0 ? memberData[memberData.length - 1].growth : 0
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
      {/* Date Range Picker */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <Button
          variant="outline"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {showDatePicker ? "Hide" : "Show"} Time Filter
        </Button>
      </div>

      {showDatePicker && (
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateRangeChange={handleDateRangeChange}
          className="mb-6"
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-900 border-red-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            {error}
            <Button
              variant="link"
              onClick={fetchMemberData}
              className="ml-2 text-red-300 hover:text-red-100 p-0 h-auto"
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Total members over time ({memberData.length} data points)
                </CardDescription>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {!isLoading && memberData.length > 0 && (
                  <>
                    {currentGrowth > 0 ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={currentGrowth > 0 ? "text-red-500" : "text-red-400"}>
                      {currentGrowth > 0 ? '+' : ''}{currentGrowth}%
                    </span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-2" />
                    <p className="text-gray-400">Loading member data...</p>
                  </div>
                </div>
              ) : memberData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">No data available for selected period</p>
                  </div>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
          <button
            onClick={handleDownloadMemberChart}
            disabled={isLoading || memberData.length === 0}
            className="w-30 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
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
            disabled={isLoading || memberData.length === 0}
            className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed border border-gray-700 text-white px-4 py-6 rounded-lg flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-red-500" />
              <div className="text-left">
                <div className="font-semibold flex items-center gap-2">
                  Member Growth Chart
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                <div className="text-sm text-gray-400">
                  {isLoading ? "Loading..." : `Download PDF report (${memberData.length} data points)`}
                </div>
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