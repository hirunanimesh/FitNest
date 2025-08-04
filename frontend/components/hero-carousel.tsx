"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const heroSlides = [
  {
    id: 1,
    image: "/images/hero-1.png",
    title: "THE ONLY BAD",
    subtitle: "WORKOUT",
    description: "IS THE ONE YOU DIDN'T DO",
    cta: "Start Your Journey",
  },
  {
    id: 2,
    image: "/images/hero-2.png",
    title: "TRANSFORM YOUR",
    subtitle: "BODY",
    description: "ACHIEVE YOUR FITNESS GOALS",
    cta: "Join FitNest",
  },
  {
    id: 3,
    image: "/images/hero-3.png",
    title: "STRONGER",
    subtitle: "TOGETHER",
    description: "FIND YOUR FITNESS COMMUNITY",
    cta: "Find Gyms",
  },
  {
    id: 4,
    image: "/images/hero-4.png",
    title: "EXPERT",
    subtitle: "GUIDANCE",
    description: "CERTIFIED TRAINERS READY TO HELP",
    cta: "Find Trainers",
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const currentSlideData = heroSlides[currentSlide]

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentSlideData.image || "/placeholder.svg"}
          alt="Fitness background"
          className="w-full h-full object-cover animate-fade-in"
          key={currentSlideData.id}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white max-w-4xl px-4">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-light tracking-wider mb-2 animate-fade-in">
              {currentSlideData.title}
            </h1>
            <h2 className="text-6xl md:text-8xl font-bold mb-4 animate-fade-in">{currentSlideData.subtitle}</h2>
            <p className="text-xl md:text-2xl font-light tracking-widest animate-fade-in">
              {currentSlideData.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90">
                  {currentSlideData.cta}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-card border-border">
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup?type=user">User</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup?type=trainer">Trainer</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup?type=gym">Gym</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 bg-transparent border-white text-white hover:bg-white hover:text-black"
            >
              <Link href="/search">Explore Gyms</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-primary" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
