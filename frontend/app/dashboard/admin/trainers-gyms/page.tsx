"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, UserCheck, MapPin, Phone, Calendar, Users, ArrowUpDown } from "lucide-react"
import Image from "next/image"

// Mock data for gyms
const gymsData = [
  {
    id: 1,
    name: "FitZone Gym",
    profilePic: "/placeholder.svg?height=50&width=50",
    address: "123 Main St, Downtown",
    contactNumber: "+1 (555) 123-4567",
    joinedDate: "2023-01-15",
    totalMembers: 245,
  },
  {
    id: 2,
    name: "PowerHouse Fitness",
    profilePic: "/placeholder.svg?height=50&width=50",
    address: "456 Oak Ave, Midtown",
    contactNumber: "+1 (555) 234-5678",
    joinedDate: "2023-03-22",
    totalMembers: 189,
  },
  {
    id: 3,
    name: "Elite Training Center",
    profilePic: "/placeholder.svg?height=50&width=50",
    address: "789 Pine Rd, Uptown",
    contactNumber: "+1 (555) 345-6789",
    joinedDate: "2022-11-08",
    totalMembers: 312,
  },
  {
    id: 4,
    name: "Muscle Factory",
    profilePic: "/placeholder.svg?height=50&width=50",
    address: "321 Elm St, Westside",
    contactNumber: "+1 (555) 456-7890",
    joinedDate: "2023-05-10",
    totalMembers: 156,
  },
]

// Mock data for trainers
const trainersData = [
  {
    id: 1,
    name: "John Smith",
    profilePic: "/placeholder.svg?height=50&width=50",
    address: "Downtown Area",
    contactNumber: "+1 (555) 111-2222",
    totalSubscribers: 45,
    joinedDate: "2023-02-01",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    profilePic: "/placeholder.svg?height=50&width=50",
    address: "Midtown District",
    contactNumber: "+1 (555) 222-3333",
    totalSubscribers: 67,
    joinedDate: "2022-12-15",
  },
  {
    id: 3,
    name: "Mike Wilson",
    profilePic: "/placeholder.svg?height=50&width=50",
    address: "Uptown Area",
    contactNumber: "+1 (555) 333-4444",
    totalSubscribers: 32,
    joinedDate: "2023-04-20",
  },
  {
    id: 4,
    name: "Emily Davis",
    profilePic: "/placeholder.svg?height=50&width=50",
    address: "Eastside",
    contactNumber: "+1 (555) 444-5555",
    totalSubscribers: 89,
    joinedDate: "2023-01-10",
  },
]
const downloadCSV = (data: any[]) => {
  const csvRows = [
    ["Name", "Address", "Contact Number", "Joined Date", "Total Members"],
    ...data.map((item) => [
      item.name,
      item.address,
      item.contactNumber,
      item.joinedDate,
      item.totalMembers,
    ]),
  ]

  const csvString = csvRows.map((row) => row.join(",")).join("\n")
  const blob = new Blob([csvString], { type: "text/csv" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "gyms_trainers_data.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export default function TrainersGymsPage() {
  const [selectedView, setSelectedView] = useState<"gyms" | "trainers">("gyms")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "members">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredAndSortedGyms = gymsData
    .filter(
      (gym) =>
        gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.address.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.joinedDate).getTime()
        const dateB = new Date(b.joinedDate).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      } else {
        return sortOrder === "asc" ? a.totalMembers - b.totalMembers : b.totalMembers - a.totalMembers
      }
    })

  const filteredAndSortedTrainers = trainersData
    .filter(
      (trainer) =>
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.address.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.joinedDate).getTime()
        const dateB = new Date(b.joinedDate).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      } else {
        return sortOrder === "asc" ? a.totalSubscribers - b.totalSubscribers : b.totalSubscribers - a.totalSubscribers
      }
    })

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
      onClick={() => downloadCSV(selectedView === "gyms" ? filteredAndSortedGyms : filteredAndSortedTrainers)}
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

          {/* Filters and Search */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder={`Search ${selectedView}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: "date" | "members") => setSortBy(value)}>
                    <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="date" className="text-white hover:bg-gray-600">
                        Join Date
                      </SelectItem>
                      <SelectItem value="members" className="text-white hover:bg-gray-600">
                        {selectedView === "gyms" ? "Members" : "Subscribers"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="border-gray-600 text-black hover:bg-gray-400"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {selectedView === "gyms" ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Gyms ({filteredAndSortedGyms.length})</h2>
                </div>
                <div className="grid gap-4">
                  {filteredAndSortedGyms.map((gym) => (
                    <Card key={gym.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <Image
                              src={gym.profilePic || "/placeholder.svg"}
                              alt={gym.name}
                              width={50}
                              height={50}
                              className="rounded-full bg-gray-700"
                            />
                            <div className="space-y-1">
                              <h3 className="font-semibold text-white text-lg">{gym.name}</h3>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <MapPin className="h-4 w-4" />
                                {gym.address}
                              </div>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Phone className="h-4 w-4" />
                                {gym.contactNumber}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                            <div className="flex flex-col items-start sm:items-end gap-2">
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Calendar className="h-4 w-4" />
                                Joined: {new Date(gym.joinedDate).toLocaleDateString()}
                              </div>
                              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                                <Users className="h-3 w-3 mr-1" />
                                {gym.totalMembers} Members
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Trainers ({filteredAndSortedTrainers.length})</h2>
                </div>
                <div className="grid gap-4">
                  {filteredAndSortedTrainers.map((trainer) => (
                    <Card key={trainer.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <Image
                              src={trainer.profilePic || "/placeholder.svg"}
                              alt={trainer.name}
                              width={50}
                              height={50}
                              className="rounded-full bg-gray-700"
                            />
                            <div className="space-y-1">
                              <h3 className="font-semibold text-white text-lg">{trainer.name}</h3>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <MapPin className="h-4 w-4" />
                                {trainer.address}
                              </div>
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Phone className="h-4 w-4" />
                                {trainer.contactNumber}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                            <div className="flex flex-col items-start sm:items-end gap-2">
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Calendar className="h-4 w-4" />
                                Joined: {new Date(trainer.joinedDate).toLocaleDateString()}
                              </div>
                              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                                <Users className="h-3 w-3 mr-1" />
                                {trainer.totalSubscribers} Subscribers
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
   
  )
}
