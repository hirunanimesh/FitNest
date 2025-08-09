import React from 'react'
import {
    Users,
    DollarSign,
    UserCheck,
  } from "lucide-react";
import StatCard from '../../../../components/statCard'

const mockAnalytics = [
    { title: "Total Members", value: 120, icon: Users, iconColor: "text-blue-500" },
    { title: "Total Trainers", value: 35, icon: UserCheck, iconColor: "text-green-500" },
    { title: "Monthly Revenue", value: 400, icon: DollarSign, iconColor: "text-yellow-500" },
    { title: "Active Subscriptions", value: 95, icon: Users, iconColor: "text-purple-500" },
  ]

const Statistics = () => {
  return (
    <div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockAnalytics.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
            />
          ))}
        </div>
    </div>
  )
}

export default Statistics
