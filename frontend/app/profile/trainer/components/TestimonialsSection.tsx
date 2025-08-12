"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Executive",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "Working with this trainer completely transformed my relationship with fitness. I've never felt stronger or more confident!",
  },
  {
    name: "Mike Chen",
    role: "Software Developer",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "The personalized approach and constant support helped me lose 30 pounds and build muscle I never thought possible.",
  },
  {
    name: "Emily Rodriguez",
    role: "Teacher",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    text: "The nutrition coaching was a game-changer. I finally understand how to fuel my body properly for my goals.",
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Client Success Stories</h3>
          <p className="text-lg text-gray-300">Real transformations from real people</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="text-center bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
