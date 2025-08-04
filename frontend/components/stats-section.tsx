"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Building, UserCheck, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"

export function StatsSection() {
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    gyms: 0,
    trainers: 0,
    success: 0,
  })

  const finalStats = {
    users: 125000,
    gyms: 2500,
    trainers: 8500,
    success: 97,
  }

  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setAnimatedStats({
        users: Math.floor(finalStats.users * progress),
        gyms: Math.floor(finalStats.gyms * progress),
        trainers: Math.floor(finalStats.trainers * progress),
        success: Math.floor(finalStats.success * progress),
      })

      if (currentStep >= steps) {
        clearInterval(timer)
        setAnimatedStats(finalStats)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [])

  const stats = [
    {
      icon: Users,
      value: `${animatedStats.users.toLocaleString()}+`,
      label: "Active Members",
      description: "Fitness enthusiasts transforming their lives",
    },
    {
      icon: Building,
      value: `${animatedStats.gyms.toLocaleString()}+`,
      label: "Partner Gyms",
      description: "Premium fitness centers nationwide",
    },
    {
      icon: UserCheck,
      value: `${animatedStats.trainers.toLocaleString()}+`,
      label: "Certified Trainers",
      description: "Expert professionals ready to guide you",
    },
    {
      icon: TrendingUp,
      value: `${animatedStats.success}%`,
      label: "Success Rate",
      description: "Members achieving their fitness goals",
    },
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 text-black">FitNest's Impact</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Join thousands of fitness enthusiasts who have transformed their lives with FitNest. Our growing community of
          gyms, trainers, and members creates the perfect ecosystem for your fitness journey.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center bg-white border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <stat.icon className="h-12 w-12 mx-auto text-primary mb-4" />
                <div className="text-3xl font-bold mb-2 text-black">{stat.value}</div>
                <div className="font-semibold mb-1 text-black">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
