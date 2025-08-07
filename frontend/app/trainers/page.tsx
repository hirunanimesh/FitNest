//show all trainers details

"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Search } from "lucide-react"
import { UserNavbar } from "@/components/user-navbar"
import Link from "next/link"

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [loading, setLoading] = useState(true)

  // Fetch trainers data from the API
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await axios.get("/api/trainers") // Replace with your API endpoint
        setTrainers(response.data)
      } catch (error) {
        console.error("Error fetching trainers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrainers()
  }, [])

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch =
      trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialization =
      selectedSpecialization === "All Specializations" || trainer.specialization.includes(selectedSpecialization)
    const matchesLocation =
      selectedLocation === "All Locations" || trainer.location.includes(selectedLocation)

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
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Loading trainers...</p>
          </div>
        ) : (
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
        )}

        {filteredTrainers.length === 0 && !loading && (
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