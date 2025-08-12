"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, TrendingUp } from "lucide-react"

interface ScrollRevealSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

function ScrollRevealSection({ children, className = "", delay = 0 }: ScrollRevealSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
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
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function ScrollRevealFeaturesSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <ScrollRevealSection>
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Why Choose FitNest?</h2>
        </ScrollRevealSection>

        <div className="grid md:grid-cols-3 gap-8">
          <ScrollRevealSection delay={200}>
            <Card className="text-center bg-white border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <div className="relative h-48 overflow-hidden flex-shrink-0">
                <img src="/images/feature-trainers.png" alt="Expert Trainers" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <Users className="absolute top-4 left-4 h-8 w-8 text-primary" />
              </div>
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-black">Expert Trainers</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center">
                <CardDescription className="text-gray-600">
                  Connect with certified personal trainers who will guide you through your fitness journey with
                  personalized plans.
                </CardDescription>
              </CardContent>
            </Card>
          </ScrollRevealSection>

          <ScrollRevealSection delay={400}>
            <Card className="text-center bg-white border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <div className="relative h-48 overflow-hidden flex-shrink-0">
                <img src="/images/feature-gyms.png" alt="Find Gyms Nearby" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <MapPin className="absolute top-4 left-4 h-8 w-8 text-primary" />
              </div>
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-black">Find Gyms Nearby</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center">
                <CardDescription className="text-gray-600">
                  Discover gyms in your area with detailed information, plans, and real-time availability for day
                  passes.
                </CardDescription>
              </CardContent>
            </Card>
          </ScrollRevealSection>

          <ScrollRevealSection delay={600}>
            <Card className="text-center bg-white border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <div className="relative h-48 overflow-hidden flex-shrink-0">
                <img src="/images/feature-progress.png" alt="Track Progress" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <TrendingUp className="absolute top-4 left-4 h-8 w-8 text-primary" />
              </div>
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-black">Track Progress</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center">
                <CardDescription className="text-gray-600">
                  Monitor your BMI, weight changes, and fitness goals with comprehensive analytics and progress
                  tracking.
                </CardDescription>
              </CardContent>
            </Card>
          </ScrollRevealSection>
        </div>
      </div>
    </section>
  )
}