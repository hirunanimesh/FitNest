import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function ReviewsSection() {
  const reviews = [
    {
      name: "Sarah Johnson",
      role: "Fitness Enthusiast",
      avatar: "/images/testimonial-sarah.png",
      rating: 5,
      review:
        "FitNest completely transformed my fitness journey! Found an amazing trainer who understood my goals perfectly. Lost 25 pounds and gained incredible strength and confidence. The platform makes everything so easy!",
    },
    {
      name: "Mike Chen",
      role: "Gym Owner",
      avatar: "/images/testimonial-mike.png",
      rating: 5,
      review:
        "As a gym owner, FitNest has been a game-changer for our business. We've connected with hundreds of new members and the platform's management tools are fantastic. Revenue increased by 40% in just 6 months!",
    },
    {
      name: "Emily Rodriguez",
      role: "Personal Trainer",
      avatar: "/images/testimonial-emily.png",
      rating: 5,
      review:
        "The verification process ensures quality clients and the scheduling system is seamless. I've built a thriving practice through FitNest and love helping people achieve their fitness dreams. Highly recommend!",
    },
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 text-black">Success Stories</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Hear from our amazing community of fitness enthusiasts, trainers, and gym partners who are achieving
          incredible results with FitNest.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Card key={index} className="bg-white border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                    <AvatarFallback className="bg-primary text-white">
                      {review.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-black">{review.name}</div>
                    <div className="text-sm text-gray-600">{review.role}</div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600">{review.review}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
