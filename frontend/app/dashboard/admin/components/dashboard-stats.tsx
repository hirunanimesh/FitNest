import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, UserCheck, CreditCard, Clock, DollarSign } from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "2,847",
    icon: Users,
    change: "+12% from last month",
    changeType: "positive" as const,
    color: "text-red-500",
  },
  {
    title: "Total Gyms",
    value: "156",
    icon: Building2,
    change: "+3 new this month",
    changeType: "positive" as const,
    color: "text-red-400",
  },
  {
    title: "Total Trainers",
    value: "423",
    icon: UserCheck,
    change: "+18 new this month",
    changeType: "positive" as const,
    color: "text-red-500",
  },
  {
    title: "Active Subscriptions",
    value: "1,924",
    icon: CreditCard,
    change: "+8% from last month",
    changeType: "positive" as const,
    color: "text-red-400",
  },
  {
    title: "Pending Verifications",
    value: "12",
    icon: Clock,
    change: "Requires attention",
    changeType: "warning" as const,
    color: "text-yellow-500",
  },
  {
    title: "Total Revenue",
    value: "$47,892",
    icon: DollarSign,
    change: "+15% from last month",
    changeType: "positive" as const,
    color: "text-red-500",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-red-600/10`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
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
