import React from 'react'
import StatCard from '../../../../components/statCard'
import { Users, Building, DollarSign, Clock } from "lucide-react"

const mockAnalytics = [
    { title: "Total Users", value: 50234, icon: Users, iconColor: "text-blue-500" },
    { title: "Total Gyms", value: 50, icon: Building, iconColor: "text-green-500" },
    { title: "Total Trainers", value: 120, icon: Users, iconColor: "text-purple-500" },
    { title: "Active Subscriptions", value: 95, icon: Users, iconColor: "text-purple-500" },
    { title: "Total Revenue", value: 2456789, icon: DollarSign, iconColor: "text-yellow-500" },
    { title: "Pending Verifications", value: 23, icon: Clock, iconColor: "text-orange-500" },
  ]

const Statistics = () => {
  return (
    <div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {mockAnalytics.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}/>
          ))}
        </div>
    </div>
  )
}

export default Statistics
