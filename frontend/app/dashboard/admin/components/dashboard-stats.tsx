"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, UserCheck, CreditCard, Clock, DollarSign } from "lucide-react"
import { GetDashboardStats } from "@/api/admin/route"

interface DashboardStat {
  icon: string
  color: string
  title: string
  value: number
  change: string
  changeType: "positive" | "warning" | "negative"
}

// Icon mapping for dynamic icon rendering
const iconMap = {
  Users,
  Building2,
  UserCheck,
  CreditCard,
  Clock,
  DollarSign,
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await GetDashboardStats()
        
        if (response.data.success) {
          setStats(response.data.data)
        } else {
          setError("Failed to fetch dashboard stats")
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        setError("Error loading dashboard stats")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700 animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-700 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-700 rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700 col-span-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm text-gray-400 hover:text-white"
            >
              Click to retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }
  

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => {
        const IconComponent = iconMap[stat.icon as keyof typeof iconMap]
        return (
          <Card key={stat.title} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-red-600/10`}>
                {IconComponent && <IconComponent className={`h-4 w-4 ${stat.color}`} />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">{stat.value.toLocaleString()}</div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={stat.changeType === "positive" ? "default" : "secondary"}
                  className={`text-xs ${
                    stat.changeType === "positive"
                      ? "bg-red-600/20 text-red-400 border-red-600/30"
                      : stat.changeType === "warning"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-gray-600/20 text-gray-400 border-gray-600/30"
                  }`}
                >
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
