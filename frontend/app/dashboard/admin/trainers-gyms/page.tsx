"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, UserCheck, MapPin, Phone, Calendar, Users } from "lucide-react"
import Image from "next/image"
import { fetchAllGyms, fetchAllTrainers } from "@/api/admin/route"

// Type definitions
interface Gym {
  gym_id: number;
  gym_name: string;
  profile_img?: string | null;
  description?: string | null;
  address: string;
  location: string;
  contact_no?: string | null;
  created_at?: string;
}

interface Trainer {
  id: number;
  trainer_name: string;
  profile_img?: string | null;
  expertise: string;
  contact_no?: string | null;
  years_of_experience: number;
  email: string;
  skills: string | string[];
  bio: string;
  rating: number;
  created_at?: string;
}

interface PaginatedResponse {
  data: Gym[] | Trainer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// CSV download function
const downloadCSV = (data: any[], type: 'gyms' | 'trainers') => {
  const headers = type === 'gyms' 
    ? ["Name", "Address", "Location", "Contact Number", "Created Date"]
    : ["Name", "Email", "Contact Number", "Expertise", "Experience", "Rating", "Created Date"];
    
  const csvRows = [
    headers,
    ...data.map((item) => 
      type === 'gyms' 
        ? [
            item.gym_name,
            item.address,
            item.location,
            item.contact_no || 'N/A',
            item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'
          ]
        : [
            item.trainer_name,
            item.email,
            item.contact_no || 'N/A',
            item.expertise,
            item.years_of_experience,
            item.rating,
            item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'
          ]
    ),
  ]

  const csvString = csvRows.map((row) => row.join(",")).join("\n")
  const blob = new Blob([csvString], { type: "text/csv" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `${type}_data.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function TrainersGymsPage() {
  const router = useRouter()
  const [selectedView, setSelectedView] = useState<"gyms" | "trainers">("gyms")
  const [searchTerm, setSearchTerm] = useState("")
  const [gyms, setGyms] = useState<Gym[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Pagination states
  const [gymPagination, setGymPagination] = useState({
    page: 1,
    hasNext: false,
    total: 0,
    totalPages: 0
  })
  const [trainerPagination, setTrainerPagination] = useState({
    page: 1,
    hasNext: false,
    total: 0,
    totalPages: 0
  })

  // Navigation functions
  const navigateToGymProfile = (gymId: number) => {
    router.push(`/dashboard/user/gym/${gymId}?adminView=true`)
  }

  const navigateToTrainerProfile = (trainerId: number) => {
    router.push(`/profile/trainer?id=${trainerId}&adminView=true`)
  }

  // Initial data loading
  useEffect(() => {
    fetchInitialData()
  }, [])

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchFilteredData()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, selectedView])

  const fetchInitialData = async () => {
    setIsLoadingData(true)
    try {
      if (selectedView === "gyms") {
        await fetchGymsData(1, true)
      } else {
        await fetchTrainersData(1, true)
      }
    } catch (error) {
      console.error("Error fetching initial data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchFilteredData = async () => {
    setIsLoadingData(true)
    try {
      if (selectedView === "gyms") {
        await fetchGymsData(1, true, searchTerm)
      } else {
        await fetchTrainersData(1, true, searchTerm)
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchGymsData = async (page: number, reset: boolean = false, search: string = "") => {
    try {
      const response = await fetchAllGyms(page, 12, search)
      
      if (response.data && response.data.gyms) {
        const gymData: PaginatedResponse = response.data.gyms
        
        if (reset) {
          setGyms(gymData.data as Gym[])
        } else {
          setGyms(prev => [...prev, ...(gymData.data as Gym[])])
        }
        
        setGymPagination({
          page: gymData.page,
          hasNext: gymData.hasNext,
          total: gymData.total,
          totalPages: gymData.totalPages
        })
      }
    } catch (error) {
      console.error("Error fetching gyms:", error)
      if (reset) setGyms([])
    }
  }

  const fetchTrainersData = async (page: number, reset: boolean = false, search: string = "") => {
    try {
      const response = await fetchAllTrainers(page, 12, search)
      
      if (response.data && response.data.trainers) {
        const trainerData: PaginatedResponse = response.data.trainers
        
        if (reset) {
          setTrainers(trainerData.data as Trainer[])
        } else {
          setTrainers(prev => [...prev, ...(trainerData.data as Trainer[])])
        }
        
        setTrainerPagination({
          page: trainerData.page,
          hasNext: trainerData.hasNext,
          total: trainerData.total,
          totalPages: trainerData.totalPages
        })
      }
    } catch (error) {
      console.error("Error fetching trainers:", error)
      if (reset) setTrainers([])
    }
  }

  const handleViewMore = async () => {
    setIsLoadingMore(true)
    try {
      if (selectedView === "gyms") {
        await fetchGymsData(gymPagination.page + 1, false, searchTerm)
      } else {
        await fetchTrainersData(trainerPagination.page + 1, false, searchTerm)
      }
    } catch (error) {
      console.error("Error loading more data:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {selectedView === "gyms" ? "Gym Management" : "Trainer Management"}
          </h1>

          {/* View Selection */}
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Button
              onClick={() => downloadCSV(selectedView === "gyms" ? gyms : trainers, selectedView)}
              className="w-full sm:w-auto lg:min-w-[120px] order-3 sm:order-1"
            >
              Download CSV
            </Button>
            
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                onClick={() => setSelectedView("gyms")}
                variant={selectedView === "gyms" ? "default" : "outline"}
                className={`flex-1 sm:flex-none ${
                  selectedView === "gyms"
                    ? "bg-red-600 hover:bg-red-700 text-white border-0"
                    : "border-gray-600 text-black hover:bg-gray-300"
                }`}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Gyms
              </Button>
              <Button
                onClick={() => setSelectedView("trainers")}
                variant={selectedView === "trainers" ? "default" : "outline"}
                className={`flex-1 sm:flex-none ${
                  selectedView === "trainers"
                    ? "bg-red-600 hover:bg-red-700 text-white border-0"
                    : "border-gray-600 text-black hover:bg-gray-300"
                }`}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Trainers
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Search {selectedView === "gyms" ? "Gyms" : "Trainers"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder={`Search ${selectedView} by name...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </CardContent>
        </Card>

        {/* Results */}
        {isLoadingData ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="w-16 h-16 border-4 border-red-500/30 rounded-full animate-spin border-t-red-500"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-rose-500/30 rounded-full animate-spin border-t-rose-500 animate-reverse"></div>
            </div>
            <p className="mt-4 text-lg text-slate-300">Loading {selectedView}...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedView === "gyms" ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Gyms ({gymPagination.total})</h2>
                </div>
                <div className="grid gap-4">
                  {gyms.map((gym) => (
                    <Card key={gym.gym_id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <Image
                              src={gym.profile_img || "/placeholder.svg"}
                              alt={gym.gym_name}
                              width={60}
                              height={60}
                              className="w-14 h-14 rounded-full bg-gray-700 cursor-pointer hover:opacity-80 transition-opacity object-cover"
                              onClick={() => navigateToGymProfile(gym.gym_id)}
                            />
                            <div className="space-y-1">
                              <h3 className="font-semibold text-white text-lg">{gym.gym_name}</h3>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <MapPin className="h-4 w-4" />
                                {gym.address}, {gym.location}
                              </div>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Phone className="h-4 w-4" />
                                {gym.contact_no || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                            <div className="flex flex-col items-start sm:items-end gap-2">
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Calendar className="h-4 w-4" />
                                Created: {gym.created_at ? new Date(gym.created_at).toLocaleDateString() : 'N/A'}
                              </div>
                              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                                <Building2 className="h-3 w-3 mr-1" />
                                ID: {gym.gym_id}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* View More Button for Gyms */}
                {gymPagination.hasNext && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={handleViewMore}
                      disabled={isLoadingMore}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl px-8 py-3 font-semibold text-lg"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        "View More Gyms"
                      )}
                    </Button>
                  </div>
                )}
                
                {/* No Results Message for Gyms */}
                {gyms.length === 0 && (
                  <div className="text-center py-16">
                    <Building2 className="w-16 h-16 text-red-500 mx-auto" />
                    <p className="mt-4 text-lg text-slate-300">No gyms found matching your criteria.</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Trainers ({trainerPagination.total})</h2>
                </div>
                <div className="grid gap-4">
                  {trainers.map((trainer) => (
                    <Card key={trainer.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <Image
                              src={trainer.profile_img || "/placeholder.svg"}
                              alt={trainer.trainer_name}
                              width={60}
                              height={60}
                              className="w-14 h-14 rounded-full bg-gray-700 cursor-pointer hover:opacity-80 transition-opacity object-cover"
                              onClick={() => navigateToTrainerProfile(trainer.id)}
                            />
                            <div className="space-y-1">
                              <h3 className="font-semibold text-white text-lg">{trainer.trainer_name}</h3>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <UserCheck className="h-4 w-4" />
                                {trainer.expertise}
                              </div>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Phone className="h-4 w-4" />
                                {trainer.contact_no || trainer.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                            <div className="flex flex-col items-start sm:items-end gap-2">
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Calendar className="h-4 w-4" />
                                Created: {trainer.created_at ? new Date(trainer.created_at).toLocaleDateString() : 'N/A'}
                              </div>
                              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                                <Users className="h-3 w-3 mr-1" />
                                Rating: {trainer.rating}/5 ({trainer.years_of_experience}y exp)
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* View More Button for Trainers */}
                {trainerPagination.hasNext && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={handleViewMore}
                      disabled={isLoadingMore}
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl px-8 py-3 font-semibold text-lg"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        "View More Trainers"
                      )}
                    </Button>
                  </div>
                )}
                
                {/* No Results Message for Trainers */}
                {trainers.length === 0 && (
                  <div className="text-center py-16">
                    <UserCheck className="w-16 h-16 text-red-500 mx-auto" />
                    <p className="mt-4 text-lg text-slate-300">No trainers found matching your criteria.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
