"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const blogPosts = [
  {
    title: "5 Morning Habits That Will Transform Your Day",
    excerpt: "Start your day right with these simple but powerful morning routines that boost energy and focus.",
    date: "Jan 15, 2025",
    readTime: "4 min read",
  },
  {
    title: "The Truth About Home Workouts vs Gym Training",
    excerpt: "Discover which training environment is best for your goals and how to maximize results anywhere.",
    date: "Jan 10, 2025",
    readTime: "6 min read",
  },
  {
    title: "Nutrition Myths That Are Sabotaging Your Progress",
    excerpt: "Debunking common nutrition misconceptions that might be holding you back from your goals.",
    date: "Jan 5, 2025",
    readTime: "5 min read",
  },
]

export default function BlogSection() {
  return (
    <section id="blog" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Latest Articles</h3>
          <p className="text-lg text-gray-300">Tips, insights, and motivation for your fitness journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer bg-gray-900 border-gray-700"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-sm text-red-500 mb-2">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <h4 className="text-white font-semibold mb-2">{post.title}</h4>
                <p className="text-gray-300">{post.excerpt}</p>
                <Button className="mt-4 w-full bg-red-600 hover:bg-red-700">Read More</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}