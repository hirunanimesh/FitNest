"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Building, UserCheck, TrendingUp } from "lucide-react"

export function ScrollRevealStatsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    gyms: 0,
    trainers: 0,
    success: 0,
  })
  const ref = useRef<HTMLDivElement>(null)

  const finalStats = {
    users: 125000,
    gyms: 2500,
    trainers: 8500,
    success: 97,
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.3,
      },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
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
    }
  }, [isVisible])

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
    <section className="py-20 px-4 bg-gray-50" ref={ref}>
      <div className="container mx-auto">
        <div
          className={`transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          }`}
        >
          <h2 className="text-3xl font-bold text-center mb-4 text-black">FitNest's Impact</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Join thousands of fitness enthusiasts who have transformed their lives with FitNest. Our growing community
            of gyms, trainers, and members creates the perfect ecosystem for your fitness journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ease-out h-full ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <Card className="text-center bg-white border-border hover:border-primary/50 transition-colors hover:shadow-lg h-full flex flex-col">
                <CardContent className="pt-6 flex-grow flex flex-col justify-center">
                  <stat.icon className="h-12 w-12 mx-auto text-primary mb-4 flex-shrink-0" />
                  <div className="text-3xl font-bold mb-2 text-black flex-shrink-0">{stat.value}</div>
                  <div className="font-semibold mb-1 text-black flex-shrink-0">{stat.label}</div>
                  <div className="text-sm text-gray-600 flex-grow flex items-center justify-center">{stat.description}</div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}