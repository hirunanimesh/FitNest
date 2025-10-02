"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users, Download, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MemberGrowth, GetSystemRevenue } from "@/api/admin/route"
import { transformMemberData, getDefaultDateRange, ChartMemberData, BackendMemberData } from "@/lib/chartUtils"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

// revenue data will be fetched dynamically

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
  // Filter member data locally (in case backend returns a superset) and recompute growth within the filtered window
  const filteredMemberData = useMemo(()=>{
    if (!dateRange.startDate || !dateRange.endDate) return memberData
    // dateRange values are YYYY-MM
    const start = new Date(dateRange.startDate + '-01')
    const end = new Date(dateRange.endDate + '-01')
    const within = memberData.filter(d => {
      if(!('dateKey' in d)) return true // safety fallback
      const dt = new Date((d as any).dateKey + '-01')
      return dt >= start && dt <= end
    })
    // Recompute growth relative to previous item inside filtered range
    return within.map((d, idx) => {
      const prevMembers = idx>0 ? within[idx-1].members : d.members
      const growth = prevMembers === 0 ? 0 : parseFloat(((d.members - prevMembers)/prevMembers*100).toFixed(1))
      return { ...d, growth }
    })
  }, [memberData, dateRange.startDate, dateRange.endDate])

  const currentGrowth = filteredMemberData.length > 0 ? filteredMemberData[filteredMemberData.length - 1].growth : 0
  const [revenueData,setRevenueData] = useState<{month:string; revenue:number}[]>([])
  const [revenueLoading,setRevenueLoading] = useState(true)
  const [revenueError,setRevenueError] = useState<string|null>(null)

  const fetchRevenue = async () => {
    try {
      setRevenueLoading(true)
      setRevenueError(null)
      const res = await GetSystemRevenue()
      const r = res.data
      if (!r || r.error) throw new Error(r.message||'Failed to load revenue')
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const arr = (r.monthlyRevenue||[]).map((val:number, idx:number)=>({ month: months[idx], revenue: val }))
      setRevenueData(arr)
    } catch(e:any) {
      setRevenueError(e.message||'Failed to fetch revenue')
    } finally {
      setRevenueLoading(false)
    }
  }

  useEffect(()=>{ fetchRevenue() },[])

  // Apply the same date range filter to revenue data (local filtering)
  const filteredRevenueData = useMemo(()=>{
    if (!dateRange.startDate || !dateRange.endDate) return revenueData;
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    // Assume data is for current year only
    return revenueData.filter(d => {
      const monthIndex = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(d.month);
      if (monthIndex === -1) return false;
      const monthDate = new Date(new Date().getFullYear(), monthIndex, 1);
      return monthDate >= start && monthDate <= end;
    });
  }, [revenueData, dateRange.startDate, dateRange.endDate]);

  const revenueGrowth = filteredRevenueData.length >= 2 ? (
    ((filteredRevenueData[filteredRevenueData.length - 1].revenue - filteredRevenueData[filteredRevenueData.length - 2].revenue) /
      (filteredRevenueData[filteredRevenueData.length - 2].revenue||1)) * 100
  ).toFixed(1) : '0.0'

  // Refs for chart capture
  const memberChartRef = useRef<HTMLDivElement|null>(null)
  const revenueChartRef = useRef<HTMLDivElement|null>(null)
  const [exporting,setExporting] = useState<{member:boolean; revenue:boolean}>({member:false,revenue:false})

  const captureElementToPdf = async (el: HTMLElement, fileName: string) => {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf') as any
    ])
    const canvas = await html2canvas(el, { backgroundColor: '#111827', scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    // Fit keeping aspect ratio
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight)
    const renderWidth = imgWidth * ratio
    const renderHeight = imgHeight * ratio
    const offsetX = (pageWidth - renderWidth)/2
    const offsetY = (pageHeight - renderHeight)/2
    pdf.setFillColor('#111827')
    pdf.rect(0,0,pageWidth,pageHeight,'F')
    pdf.addImage(imgData,'PNG', offsetX, offsetY, renderWidth, renderHeight)
    const generatedName = fileName.replace(/\s+/g,'_').toLowerCase()+`_${new Date().toISOString().slice(0,10)}.pdf`
    pdf.save(generatedName)
  }

  const handleDownloadMemberChart = async () => {
    if (!memberChartRef.current) return
    try {
      setExporting(s=>({...s,member:true}))
      await captureElementToPdf(memberChartRef.current, 'Member Growth Chart')
    } catch(e){
      console.error('Failed to export member chart', e)
    } finally { setExporting(s=>({...s,member:false})) }
  }

  const handleDownloadRevenueChart = async () => {
    if (!revenueChartRef.current) return
    try {
      setExporting(s=>({...s,revenue:true}))
      await captureElementToPdf(revenueChartRef.current, 'Monthly Revenue Chart')
    } catch(e){
      console.error('Failed to export revenue chart', e)
    } finally { setExporting(s=>({...s,revenue:false})) }
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
          <Card className="bg-gray-800 border-gray-700" ref={memberChartRef}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-500" />
                  Member Growth
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Total members over time ({filteredMemberData.length} data points)
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
              ) : filteredMemberData.length === 0 ? (
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
                    <AreaChart data={filteredMemberData}>
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
            disabled={isLoading || memberData.length === 0 || exporting.member}
            className="w-30 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {exporting.member ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting.member ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        {/* Revenue Chart */}
        <div className="space-y-3">
          <Card className="bg-gray-800 border-gray-700" ref={revenueChartRef}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-400" />
                  Monthly Revenue
                </CardTitle>
                <CardDescription className="text-gray-400">Revenue generated each month (platform fees)</CardDescription>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {revenueLoading ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : (
                  <>
                    <TrendingUp className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">+{revenueGrowth}%</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {revenueError && (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-sm text-red-400">
                    {revenueError}
                    <Button variant="link" className="text-red-300 hover:text-red-200 p-0 ml-1" onClick={fetchRevenue}>Retry</Button>
                  </div>
                </div>
              )}
              {!revenueError && (
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
                  {revenueLoading ? (
                    <div className="flex items-center justify-center text-gray-400 text-sm">Loading revenue...</div>
                  ) : filteredRevenueData.length === 0 ? (
                    <div className="flex items-center justify-center text-gray-500 text-sm">No revenue data</div>
                  ) : (
                  <BarChart data={filteredRevenueData}>
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
                  )}
                </ResponsiveContainer>
              </ChartContainer>
              )}
            </CardContent>
          </Card>
          <button
            onClick={handleDownloadRevenueChart}
            disabled={revenueLoading || filteredRevenueData.length===0 || exporting.revenue}
            className="w-30 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {exporting.revenue ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting.revenue ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Mobile View - Buttons Only */}
      <div className="lg:hidden space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleDownloadMemberChart}
            disabled={isLoading || memberData.length === 0 || exporting.member}
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
                  {isLoading ? "Loading..." : exporting.member ? 'Generating PDF...' : `Download PDF report (${memberData.length} data points)`}
                </div>
              </div>
            </div>
            {exporting.member ? <Loader2 className="w-5 h-5 animate-spin text-red-400" /> : <Download className="w-5 h-5 text-red-400" />}
          </button>
          
          <button
            onClick={handleDownloadRevenueChart}
            disabled={revenueLoading || filteredRevenueData.length===0 || exporting.revenue}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-6 rounded-lg flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-red-400" />
              <div className="text-left">
                <div className="font-semibold">Revenue Chart</div>
                <div className="text-sm text-gray-400">{exporting.revenue ? 'Generating PDF...' : 'Download PDF report'}</div>
              </div>
            </div>
            {exporting.revenue ? <Loader2 className="w-5 h-5 animate-spin text-red-400" /> : <Download className="w-5 h-5 text-red-400" />}
          </button>
        </div>
      </div>
    </div>
  )
}