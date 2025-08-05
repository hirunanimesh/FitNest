"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Clock, DollarSign, Navigation, Eye } from "lucide-react"
import { UserNavbar } from "@/components/user-navbar"
import Link from "next/link"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")

  // Mock data
  const gyms = [
    {
      id: 1,
      name: "FitZone Premium",
      location: "Downtown, 2.3 km away",
      rating: 4.8,
      reviews: 124,
      image: "/placeholder.svg?height=200&width=300",
      dayPassPrice: 15,
      plans: [
        { name: "Day Pass", price: 15, color: "bg-green-500" },
        { name: "Weekly", price: 80, color: "bg-blue-500" },
        { name: "Monthly", price: 299, color: "bg-purple-500" },
      ],
      amenities: ["Pool", "Sauna", "Personal Training", "Group Classes"],
    },
    {
      id: 2,
      name: "Iron Paradise",
      location: "Midtown, 1.8 km away",
      rating: 4.6,
      reviews: 89,
      image: "/placeholder.svg?height=200&width=300",
      dayPassPrice: 12,
      plans: [
        { name: "Day Pass", price: 12, color: "bg-green-500" },
        { name: "Weekly", price: 70, color: "bg-blue-500" },
        { name: "Monthly", price: 249, color: "bg-purple-500" },
      ],
      amenities: ["Free Weights", "Cardio", "Locker Rooms"],
    },
  ]

  const trainers = [
    {
      id: 1,
      name: "Sarah Johnson",
      specialization: "Weight Loss & Strength Training",
      rating: 4.9,
      reviews: 67,
      image: "/placeholder.svg?height=200&width=200",
      hourlyRate: 75,
      experience: "5 years",
      certifications: ["NASM-CPT", "Nutrition Specialist"],
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      specialization: "Bodybuilding & Powerlifting",
      rating: 4.7,
      reviews: 43,
      image: "/placeholder.svg?height=200&width=200",
      hourlyRate: 85,
      experience: "8 years",
      certifications: ["ACSM-CPT", "Powerlifting Coach"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Gyms & Trainers</h1>

          {/* Search Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="near-me">Near Me</SelectItem>
                <SelectItem value="downtown">Downtown</SelectItem>
                <SelectItem value="midtown">Midtown</SelectItem>
                <SelectItem value="uptown">Uptown</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <MapPin className="mr-2 h-4 w-4" />
              Find Near Me
            </Button>
          </div>
        </div>

        <Tabs defaultValue="gyms" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gyms">Gyms</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
          </TabsList>

          <TabsContent value="gyms" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gyms.map((gym) => (
                <Card key={gym.id} className="overflow-hidden">
                  <div className="relative">
                    <img src={gym.image || "/placeholder.svg"} alt={gym.name} className="w-full h-48 object-cover" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white text-black">${gym.dayPassPrice} Day Pass</Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{gym.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {gym.location}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-semibold">{gym.rating}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{gym.reviews} reviews</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Plans */}
                      <div>
                        <p className="font-semibold mb-2">Available Plans:</p>
                        <div className="flex gap-2">
                          {gym.plans.map((plan, index) => (
                            <Badge key={index} variant="secondary" className={`${plan.color} text-white`}>
                              {plan.name}: ${plan.price}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Amenities */}
                      <div>
                        <p className="font-semibold mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {gym.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1">
                          <Navigation className="mr-2 h-4 w-4" />
                          Get Directions
                        </Button>
                        <Button asChild variant="outline" className="flex-1 bg-transparent">
                          <Link href={`/gym/${gym.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Plans
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trainers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trainers.map((trainer) => (
                <Card key={trainer.id}>
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={trainer.image || "/placeholder.svg"} alt={trainer.name} />
                        <AvatarFallback>
                          {trainer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{trainer.name}</CardTitle>
                        <CardDescription className="mt-1">{trainer.specialization}</CardDescription>
                        <div className="flex items-center mt-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-semibold mr-2">{trainer.rating}</span>
                          <span className="text-sm text-muted-foreground">({trainer.reviews} reviews)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-lg font-bold">
                          <DollarSign className="h-4 w-4 mr-1" />${trainer.hourlyRate}/hr
                        </div>
                        <p className="text-sm text-muted-foreground">{trainer.experience} experience</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Certifications */}
                      <div>
                        <p className="font-semibold mb-2">Certifications:</p>
                        <div className="flex flex-wrap gap-1">
                          {trainer.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button asChild className="flex-1">
                          <Link href={`/trainer/${trainer.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </Link>
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <Clock className="mr-2 h-4 w-4" />
                          Book Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
