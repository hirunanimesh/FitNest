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
import TrainerCard from "@/components/TrainerCard" // Assuming you have a TrainerCard component

// Added a type definition for the gym and trainer data
interface Gym {
  gym_id: number;
  gym_name: string;
  profile_img?: string | null;
  description?: string | null;
  address: string;
  location: string;
  contact_no?: string | null;
}

interface Trainer {
  id: number;
  trainer_name: string;
  profile_img?: string | null;
  expertise: string;
  contact_no?: string | null;
  experience_years: number; // Added experience years
  email: string; // Added email
  skills: string| string[]; // Added skills as an array
  bio: string; // Added bio as a paragraph
  year_of_experience: number; // Added to match TrainerCard's Trainer type
  rating: number; // Added to match TrainerCard's Trainer type
}
interface TrainerCardProps {
  trainer: Trainer;
}

export default function SearchPage() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [view, setView] = useState<"gyms" | "trainers">("gyms") // Toggle state

  useEffect(() => {
    // Fetch gym data from the backend
    axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/gym/getallgyms`)
      .then((response) => {
        if (response.data && Array.isArray(response.data.gyms)) {
          setGyms(response.data.gyms)
        } else {
          console.error("Unexpected response format:", response.data)
          setGyms([])
        }
      }).catch((error) => {
        console.error("Error fetching gyms:", error)
        setGyms([])
      })

    // Fetch trainer data from the backend
    axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/getalltrainers`)
      .then((response) => {
        if (response.data && Array.isArray(response.data.trainers)) {
          setTrainers(response.data.trainers)
        } else {
          console.error("Unexpected response format:", response.data)
          setTrainers([])
        }
      }).catch((error) => {
        console.error("Error fetching trainers:", error)
        setTrainers([])
      })
  }, [])

  return (
    <div className="bg-black-400 min-h-screen">
    <div className="min-h-screen bg-black text-white">
      <UserNavbar />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Gyms and Trainers in Sri Lanka</h1>

          {/* Toggle Buttons */}
          <div className="flex gap-4 mb-6 ">
            <Button 
              variant={view === "gyms" ? "default" : "outline" }
              onClick={() => setView("gyms")}
              className={view === "gyms" ? "" : "bg-[#192024] text-white"}
            >
              View Gyms
            </Button>
            <Button
              variant={view === "trainers" ? "default" : "outline"}
              onClick={() => setView("trainers")}
              className={view === "trainers" ? "" : "bg-[#192024] text-white"}
            >
              View Trainers
            </Button>
          </div>

          {/* Search Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 ">
            <div className="flex-1 " >
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#192024] text-white"
              />
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48 bg-[#192024]">
                <SelectValue placeholder="Location  " />
              </SelectTrigger>
              <SelectContent className=" bg-[#192024] text-white">
                {/* Updated dropdown menu with real district names */}
                <SelectItem value="default">All Locations</SelectItem>
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

        {/* Display Gym or Trainer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {view === "gyms" &&
            gyms
              .filter((gym) => {
                const matchesName = gym.gym_name.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesLocation =
                  !selectedLocation || selectedLocation === "default"|| gym.location.toLowerCase() === selectedLocation
                return matchesName && matchesLocation
              })
              .map((gym) => <GymCard key={gym.gym_id} gym={gym} />)}

          {view === "trainers" &&
            trainers
              .filter((trainer) => {
                const matchesName = trainer.trainer_name.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesLocation =
                  !selectedLocation || trainer.expertise.toLowerCase().includes(selectedLocation)
                return matchesName && matchesLocation
              })
              .map((trainer) => (
  <TrainerCard key={trainer.id} trainer={trainer} />
))}

        </div>
      </div>
    </div>
    </div>
  )
}