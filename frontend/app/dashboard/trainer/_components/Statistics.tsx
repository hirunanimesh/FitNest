import React from 'react'
import StatCard from '../../../../components/statCard'
import { Users, Dumbbell, DollarSign, Clock } from "lucide-react"

const mockAnalytics=[
    { title: "Total Users", value: 50, icon: Users, iconColor: "text-blue-500" },
    { title: "Total Plans", value: 10, icon: Dumbbell, iconColor: "text-green-500" },
    { title: "Monthly Revenue", value: 100000, icon: DollarSign, iconColor: "text-yellow-500" },
    { title: "Today Schedules", value: 5, icon: Clock, iconColor: "text-orange-500" },
]

const Statistics = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mockAnalytics.map((item,index)=>(
            <StatCard
                key={index}
                title={item.title}
                value={item.value}
                icon={item.icon}
                iconColor={item.iconColor}
            />
        ))}
      </div>
    </div>
  )
}

export default Statistics
