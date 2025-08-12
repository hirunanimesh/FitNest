"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <Badge className="mb-4 bg-red-100 text-red-800">Certified Personal Trainer</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Transform Your Body, Transform Your Life
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Helping busy professionals achieve their fitness goals through personalized training, nutrition coaching, and mindset transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">Start Your Journey</Button>
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Download My App
            </Button>
          </div>
        </div>
        <div className="relative">
          <img src="/placeholder.svg?height=500&width=400" alt="Alex Thompson" className="rounded-2xl shadow-2xl w-full max-w-md mx-auto" />
          <div className="absolute -bottom-6 -left-6 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <span className="text-sm font-semibold text-white">5.0 (127 reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
