"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Calendar,
  Users,
  Heart,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Clock,
  Video,
} from "lucide-react"

export default function FitnessTrainerProfile() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  const sessions = [
    {
      session_id: "1",
      title: "One-on-One Coaching",
      description: "Personalized training sessions tailored to your specific goals and fitness level.",
      price: 80.0,
      duration: "60 minutes",
      date: "2025-01-15",
      time: "10:00",
      zoom_link: "https://zoom.us/j/123456789",
      booked: false,
      features: ["Custom workout plans", "Nutrition guidance", "Progress tracking", "24/7 support"],
    },
    {
      session_id: "2",
      title: "Group Fitness Classes",
      description: "High-energy group sessions that build community while you get fit.",
      price: 25.0,
      duration: "45 minutes",
      date: "2025-01-16",
      time: "18:00",
      zoom_link: "https://zoom.us/j/987654321",
      booked: false,
      features: ["HIIT workouts", "Strength training", "Cardio sessions", "Fun atmosphere"],
    },
    {
      session_id: "3",
      title: "Nutrition Planning",
      description: "Comprehensive meal planning and nutritional guidance for optimal results.",
      price: 120.0,
      duration: "90 minutes",
      date: "2025-01-17",
      time: "14:00",
      zoom_link: "https://zoom.us/j/456789123",
      booked: false,
      features: ["Custom meal plans", "Grocery lists", "Recipe suggestions", "Weekly check-ins"],
    },
    {
      session_id: "4",
      title: "Mindset & Lifestyle Coaching",
      description: "Mental wellness coaching to help you build lasting healthy habits.",
      price: 100.0,
      duration: "50 minutes",
      date: "2025-01-18",
      time: "16:00",
      zoom_link: "https://zoom.us/j/789123456",
      booked: true,
      features: ["Goal setting", "Habit formation", "Stress management", "Motivation techniques"],
    },
  ]

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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Alex Thompson</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-300 hover:text-red-400 transition-colors">
                About
              </a>
              <a href="#sessions" className="text-gray-300 hover:text-red-400 transition-colors">
                Sessions
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-red-400 transition-colors">
                Testimonials
              </a>
              <a href="#blog" className="text-gray-300 hover:text-red-400 transition-colors">
                Blog
              </a>
              <a href="#contact" className="text-gray-300 hover:text-red-400 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-red-100 text-red-800 hover:bg-red-200">Certified Personal Trainer</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Transform Your Body, Transform Your Life
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Helping busy professionals achieve their fitness goals through personalized training, nutrition
                coaching, and mindset transformation. Get fit from home or in-person.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  Start Your Journey
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  Download My App
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg?height=500&width=400"
                alt="Alex Thompson - Personal Trainer"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-white">5.0 (127 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">About Alex</h3>
              <p className="text-lg text-gray-300">
                Passionate about helping people discover their strength and potential
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h4 className="text-xl font-semibold text-white mb-4">My Story</h4>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  With over 8 years of experience in fitness and wellness, I've dedicated my career to helping busy
                  professionals reclaim their health and confidence. My approach combines evidence-based training
                  methods with personalized nutrition and mindset coaching.
                </p>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  I specialize in working with remote workers, executives, and parents who struggle to find time for
                  fitness. My programs are designed to fit into your busy lifestyle while delivering real, sustainable
                  results.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      NASM Certified Personal Trainer
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      Precision Nutrition Level 1
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                      Corrective Exercise Specialist
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Users className="w-8 h-8 text-red-600" />
                      <div>
                        <div className="text-2xl font-bold text-white">500+</div>
                        <div className="text-sm text-gray-400">Clients Transformed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-8 h-8 text-red-600" />
                      <div>
                        <div className="text-2xl font-bold text-white">8+</div>
                        <div className="text-sm text-gray-400">Years Experience</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Star className="w-8 h-8 text-red-600" />
                      <div>
                        <div className="text-2xl font-bold text-white">5.0</div>
                        <div className="text-sm text-gray-400">Average Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions Section */}
      <section id="sessions" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Available Sessions</h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Book individual training sessions tailored to your unique needs and schedule
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sessions.map((session) => (
              <Card
                key={session.session_id}
                className={`bg-gray-900 border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-red-500 ${
                  selectedSession === session.session_id ? "ring-2 ring-red-500" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-white">{session.title}</CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-400">${session.price}</span>
                    <span className="text-sm text-gray-400">{session.duration}</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Video className="w-4 h-4" />
                      <span>Zoom Session</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">{session.description}</p>
                  <ul className="space-y-2 mb-4">
                    {session.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-400 flex items-center">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${session.booked ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                    disabled={session.booked}
                  >
                    {session.booked ? "Booked" : "Book Session"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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

      {/* Blog Section */}
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
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h4 className="font-semibold text-white mb-3 line-clamp-2">{post.title}</h4>
                  <p className="text-gray-300 text-sm line-clamp-3">{post.excerpt}</p>
                  <Button variant="link" className="p-0 mt-3 text-red-400 hover:text-red-300">
                    Read More →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
              View All Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Get In Touch</h3>
              <p className="text-lg text-gray-300">Ready to start your transformation? Let's talk about your goals.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h4 className="text-xl font-semibold text-white mb-6">Contact Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-red-600" />
                    <span className="text-gray-300">(555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-red-600" />
                    <span className="text-gray-300">alex@fitnesscoach.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <span className="text-gray-300">Downtown Fitness Studio, City Center</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h5 className="font-semibold text-white mb-4">Follow Me</h5>
                  <div className="flex space-x-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <Instagram className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Send a Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-700 text-white"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-700 text-white"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-700 text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-700 text-white"
                      placeholder="Tell me about your fitness goals..."
                    ></textarea>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700">Send Message</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h5 className="font-bold">Alex Thompson</h5>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming lives through fitness, nutrition, and mindset coaching.
              </p>
            </div>

            <div>
              <h6 className="font-semibold mb-4">Quick Links</h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#sessions" className="text-gray-400 hover:text-white transition-colors">
                    Sessions
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#blog" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h6 className="font-semibold mb-4">Sessions</h6>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-gray-400">Personal Training</span>
                </li>
                <li>
                  <span className="text-gray-400">Group Classes</span>
                </li>
                <li>
                  <span className="text-gray-400">Nutrition Coaching</span>
                </li>
                <li>
                  <span className="text-gray-400">Mindset Coaching</span>
                </li>
              </ul>
            </div>

            <div>
              <h6 className="font-semibold mb-4">Contact</h6>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>(555) 123-4567</li>
                <li>alex@fitnesscoach.com</li>
                <li>Downtown Fitness Studio</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Alex Thompson Fitness. All rights reserved. |
              <a href="#" className="hover:text-white transition-colors ml-1">
                Download My App
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
