import { Users, Dumbbell, Heart, Calendar, Trophy, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {Navbar} from "@/components/navbar"

export default function AboutPage() {
  const userBenefits = [
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: "Find Your Perfect Gym",
      description: "Browse and subscribe to gym memberships that match your fitness goals and location preferences.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Connect with Expert Trainers",
      description: "Discover certified personal trainers and book sessions that fit your schedule and fitness level.",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Flexible Scheduling",
      description:
        "Book gym sessions and training appointments at your convenience with our easy-to-use calendar system.",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Track Your Progress",
      description: "Monitor your fitness journey with detailed progress tracking and achievement milestones.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Personalized Experience",
      description: "Get customized workout plans and recommendations based on your fitness goals and preferences.",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Quality Assurance",
      description:
        "All gyms and trainers are verified and rated by our community to ensure you get the best experience.",
    },
  ]

  const whatYouCanDo = [
    {
      title: "For Fitness Enthusiasts",
      description:
        "Subscribe to gym memberships, book personal training sessions, track your workouts, and connect with a community of like-minded fitness lovers.",
      color: "from-orange-500 to-red-500",
      actions: ["Subscribe to gyms", "Book trainer sessions", "Track progress", "Join fitness community"],
    },
    {
      title: "For Gym Owners",
      description:
        "Create membership plans, manage your facility, assign trainers, track revenue, and grow your member base with powerful analytics.",
      color: "from-red-500 to-orange-600",
      actions: ["Create membership plans", "Manage facilities", "Track revenue", "Grow member base"],
    },
    {
      title: "For Personal Trainers",
      description:
        "Offer training services, manage your schedule, work with multiple gyms, build your client base, and grow your fitness business.",
      color: "from-orange-600 to-red-400",
      actions: ["Offer training plans", "Manage schedules", "Build client base", "Grow your business"],
    },
  ]

  return (
   
    <div className="min-h-screen bg-gray-900 text-white pt-16">
      <Navbar/>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-11">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              FitConnect
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your gateway to a healthier, stronger you. Connect with the best gyms and trainers in your area.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-orange-500" />
                <span>Health Focused</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                <span>Community Driven</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-400" />
                <span>Quality Assured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">How We Help You</h2>
          <p className="text-lg text-gray-300 leading-relaxed mb-8">
            FitConnect is designed to make your fitness journey easier, more enjoyable, and more successful. Whether
            you're just starting out or you're a seasoned athlete, we provide the tools and connections you need to
            reach your goals.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Connect</h3>
              <p className="text-gray-400">Find and connect with the best gyms and trainers in your area</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Train</h3>
              <p className="text-gray-400">Access personalized workouts and professional guidance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Achieve</h3>
              <p className="text-gray-400">Track your progress and celebrate your fitness milestones</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">What You Can Do</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Discover all the ways FitConnect can enhance your fitness journey and help you achieve your goals
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userBenefits.map((benefit, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="text-orange-500 mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Your Fitness Journey Starts Here</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Whether you're looking to get fit, grow your business, or share your expertise, FitConnect has something
              for you
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {whatYouCanDo.map((section, index) => (
              <Card
                key={index}
                className="bg-gray-800 border-gray-700 overflow-hidden group hover:scale-105 transition-transform"
              >
                <div className={`h-2 bg-gradient-to-r ${section.color}`} />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-white">{section.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{section.description}</p>
                  <div className="space-y-2">
                    {section.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-sm text-gray-300">{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Preview */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Real Results from Real People</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Join thousands of users who have transformed their fitness journey with FitConnect
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">10,000+</div>
              <div className="text-gray-300 font-semibold mb-1">Active Members</div>
              <div className="text-sm text-gray-400">Growing every day</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">500+</div>
              <div className="text-gray-300 font-semibold mb-1">Partner Gyms</div>
              <div className="text-sm text-gray-400">Across the country</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">1,200+</div>
              <div className="text-gray-300 font-semibold mb-1">Certified Trainers</div>
              <div className="text-sm text-gray-400">Ready to help you</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Start Your Fitness Journey?</h2>
          <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
            Join FitConnect today and discover how easy it can be to find the perfect gym, trainer, and fitness
            community for your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started Today
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors">
              Browse Gyms & Trainers
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
