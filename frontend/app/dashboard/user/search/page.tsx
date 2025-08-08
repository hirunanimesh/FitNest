"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNavbar } from "@/components/user-navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"
import Link from "next/link"
import GymCard from "@/components/GymCard"

// Added a type definition for the gym data
interface Gym {
  gym_id: number;
  gym_name: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  dayPassPrice: number;
  plans: { title: string; price: number; color: string }[];
  amenities: string[];
}

export default function SearchPage() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")

  useEffect(() => {
    // Fetch gym data from the backend
    axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/gym/getallgyms`)
    .then((response) => {
      setGyms(response.data);
    }).catch((error) => {
      console.error("Error fetching gyms:", error);
    });
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Gyms in Sri Lanka</h1>

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
                {/* Updated dropdown menu with real district names */}
                <SelectItem value="ampara">Ampara</SelectItem>
                <SelectItem value="anuradhapura">Anuradhapura</SelectItem>
                <SelectItem value="badulla">Badulla</SelectItem>
                <SelectItem value="batticaloa">Batticaloa</SelectItem>
                <SelectItem value="colombo">Colombo</SelectItem>
                <SelectItem value="galle">Galle</SelectItem>
                <SelectItem value="gampaha">Gampaha</SelectItem>
                <SelectItem value="hambantota">Hambantota</SelectItem>
                <SelectItem value="jaffna">Jaffna</SelectItem>
                <SelectItem value="kalutara">Kalutara</SelectItem>
                <SelectItem value="kandy">Kandy</SelectItem>
                <SelectItem value="kegalle">Kegalle</SelectItem>
                <SelectItem value="kilinochchi">Kilinochchi</SelectItem>
                <SelectItem value="kurunegala">Kurunegala</SelectItem>
                <SelectItem value="mannar">Mannar</SelectItem>
                <SelectItem value="matale">Matale</SelectItem>
                <SelectItem value="matara">Matara</SelectItem>
                <SelectItem value="moneragala">Moneragala</SelectItem>
                <SelectItem value="mullaitivu">Mullaitivu</SelectItem>
                <SelectItem value="nuwara-eliya">Nuwara Eliya</SelectItem>
                <SelectItem value="polonnaruwa">Polonnaruwa</SelectItem>
                <SelectItem value="puttalam">Puttalam</SelectItem>
                <SelectItem value="ratnapura">Ratnapura</SelectItem>
                <SelectItem value="trincomalee">Trincomalee</SelectItem>
                <SelectItem value="vavuniya">Vavuniya</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <MapPin className="mr-2 h-4 w-4" />
              Find Near Me
            </Button>
          </div>
        </div>

        {/* Display Gym Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gyms
            .filter((gym) => {
              // Filter by name
              const matchesName = gym.gym_name.toLowerCase().includes(searchQuery.toLowerCase());
              // Filter by location
              const matchesLocation =
                !selectedLocation || gym.location.toLowerCase() === selectedLocation;
              // Show all if no filters, else filter
              if (!searchQuery && !selectedLocation) return true;
              return matchesName && matchesLocation;
            })
            .map((gym) => (
              <GymCard key={gym.gym_id} gym={gym} />
            ))}
        </div>
      </div>
    </div>
  )
}
