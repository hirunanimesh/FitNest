"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, MapPin, TrendingUp, Play } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import VideoBackground from "@/components/video-background"

export function HeroVideoSection() {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* YouTube Video Background - Only for this section */}
      <div className="absolute inset-0 z-0">
        <VideoBackground />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center items-center h-full text-center text-white px-4 pt-20">
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-xs md:text-sm font-light tracking-widest mb-6 text-primary">FITNESS & WELLNESS</p>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-8">
            We see a world where
            <br />
            <span className="text-primary">everyone achieves</span>
            <br />
            their fitness goals
          </h1>

          <div className="flex flex-col sm:flex-row gap-12 justify-center mb-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="default" className="text-base px-6 py-3 bg-primary hover:bg-primary/90">
                  Start Your Journey
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-white border-border">
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup?type=user" className="text-black">
                    User
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup?type=trainer" className="text-black">
                    Trainer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup?type=gym" className="text-black">
                     Gym
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              asChild
              variant="outline"
              size="default"
              className="text-base px-6 py-3 bg-transparent border-white text-white hover:bg-white hover:text-black"
            >
              <Link href="/about">
                <Play className="mr-2 h-4 w-4" />
                Watch Motivation
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-40 max-w-7xl mx-auto">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-black/30 transition-all duration-300 group">
            <CardContent className="p-5">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-primary/10 backdrop-blur-sm rounded-lg mr-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-4">Expert Trainers</h3>
                  <p className="text-primary font-semibold text-base mb-3">8,500+ certified professionals</p>
                  <p className="text-white/70 text-lg leading-relaxed ">
                    Connect with certified personal trainers across multiple specializations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-black/30 transition-all duration-300 group">
            <CardContent className="p-5">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-primary/10 backdrop-blur-sm rounded-lg mr-4 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">Global Reach</h3>
                  <p className="text-primary font-semibold text-base mb-2">2,500+ partner gyms</p>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Premium fitness centers across 90+ markets worldwide
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-white/10 text-white hover:bg-black/30 transition-all duration-300 group">
            <CardContent className="p-5">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-primary/10 backdrop-blur-sm rounded-lg mr-4 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">Smart Analytics</h3>
                  <p className="text-primary font-semibold text-base mb-2">AI-powered insights</p>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Advanced progress tracking and personalized recommendations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
