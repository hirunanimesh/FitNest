"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Search } from "lucide-react"
import { UserNavbar } from "@/components/user-navbar"
import Link from "next/link"

export default function TrainersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")

  // Mock trainers data
  const trainers = [
    {
      id: 1,
      name: "Sarah Johnson",
      specialization: "Weight Loss & Strength Training",
      rating: 4.9,
      reviews: 127,
      hourlyRate: 75,
      experience: "5 years",
      location: "Downtown, 2.1 km away",
      image: "/images/trainer-sarah.png",
      certifications: ["NASM-CPT", "Nutrition Specialist"],
      availability: "Available Today",
      registeredGyms: ["FitZone Premium", "Iron Paradise"],
      bio: "Passionate about helping clients achieve sustainable weight loss and build strength.",
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      specialization: "Bodybuilding & Powerlifting",
      rating: 4.7,
      reviews: 89,
      hourlyRate: 85,
      experience: "8 years",
      location: "Midtown, 1.8 km away",
      image: "/images/trainer-mike.png",
      certifications: ["ACSM-CPT", "Powerlifting Coach"],
      availability: "Available Tomorrow",
      registeredGyms: ["Muscle Factory", "Power Gym"],
      bio: "Former competitive powerlifter specializing in strength and muscle building.",
    },
    {
      id: 3,
      name: "Emily Chen",
      specialization: "Yoga & Flexibility",
      rating: 4.8,
      reviews: 156,
      hourlyRate: 65,
      experience: "6 years",
      location: "Uptown, 3.2 km away",
      image: "/images/trainer-emily.png",
      certifications: ["RYT-500", "Pilates Instructor"],
      availability: "Available Today",
      registeredGyms: ["Zen Fitness", "Harmony Studio"],
      bio: "Certified yoga instructor focused on mindfulness and body alignment.",
    },
    {
      id: 4,
      name: "David Thompson",
      specialization: "HIIT & Cardio",
      rating: 4.6,
      reviews: 98,
      hourlyRate: 70,
      experience: "4 years",
      location: "Downtown, 1.5 km away",
      image: "/images/trainer-david.png",
      certifications: ["HIIT Specialist", "Cardio Coach"],
      availability: "Available This Week",
      registeredGyms: ["CardioMax", "FitZone Premium"],
      bio: "High-energy trainer specializing in fat burning and cardiovascular fitness.",
    },
    {
      id: 5,
      name: "Lisa Martinez",
      specialization: "Rehabilitation & Recovery",
      rating: 4.9,
      reviews: 203,
      hourlyRate: 90,
      experience: "10 years",
      location: "Medical District, 4.1 km away",
      image: "/images/trainer-lisa.png",
      certifications: ["Physical Therapy", "Corrective Exercise"],
      availability: "Booking Required",
      registeredGyms: ["Recovery Center", "Wellness Hub"],
      bio: "Licensed physical therapist specializing in injury recovery and prevention.",
    },
    {
      id: 6,
      name: "Alex Kim",
      specialization: "CrossFit & Functional Training",
      rating: 4.7,
      reviews: 134,
      hourlyRate: 80,
      experience: "7 years",
      location: "Sports Complex, 2.8 km away",
      image: "/images/trainer-alex.png",
      certifications: ["CrossFit Level 2", "Functional Movement"],
      availability: "Available Today",
      registeredGyms: ["CrossFit Box", "Functional Fitness"],
      bio: "CrossFit athlete and coach focused on functional movement patterns.",
    },
  ]

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch =
      trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialization = !selectedSpecialization || trainer.specialization.includes(selectedSpecialization)
    const matchesLocation = !selectedLocation || trainer.location.includes(selectedLocation)

    return matchesSearch && matchesSpecialization && matchesLocation
  })

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-white">Find Your Perfect Trainer</h1>
          <p className="text-muted-foreground mb-6">
            Connect with certified personal trainers who will guide you through your fitness journey
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search trainers by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Specializations">All Specializations</SelectItem>
                <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                <SelectItem value="Bodybuilding">Bodybuilding</SelectItem>
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="HIIT">HIIT</SelectItem>
                <SelectItem value="Rehabilitation">Rehabilitation</SelectItem>
                <SelectItem value="CrossFit">CrossFit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Locations">All Locations</SelectItem>
                <SelectItem value="Downtown">Downtown</SelectItem>
                <SelectItem value="Midtown">Midtown</SelectItem>
                <SelectItem value="Uptown">Uptown</SelectItem>
                <SelectItem value="Medical District">Medical District</SelectItem>
                <SelectItem value="Sports Complex">Sports Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer) => (
            <Link key={trainer.id} href={`/trainer/${trainer.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group bg-card border-border">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={trainer.image || "/placeholder.svg"}
                    alt={trainer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Overlay Content */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-primary text-white">${trainer.hourlyRate}/hr</Badge>
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        {trainer.availability}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold mb-1">{trainer.name}</h3>
                    <p className="text-sm text-gray-200 mb-2">{trainer.specialization}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{trainer.rating}</span>
                        <span className="text-sm text-gray-300">({trainer.reviews})</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <MapPin className="h-4 w-4 mr-1" />
                        {trainer.experience}
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {trainer.location}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {trainer.certifications.slice(0, 2).map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{trainer.bio}</p>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-muted-foreground">
                        {trainer.registeredGyms.length} gym{trainer.registeredGyms.length !== 1 ? "s" : ""}
                      </span>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredTrainers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No trainers found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSearchQuery("")
                setSelectedSpecialization("All Specializations")
                setSelectedLocation("All Locations")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
