"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"
import GymCard from "@/components/GymCard"
import TrainerCard from "@/components/TrainerCard" // Assuming you have a TrainerCard component
import GymsMapView from "@/components/GymsMapView"

import { useRouter } from "next/navigation"

import { GetOneDayGyms, GetOtherGyms } from "@/api/user/route"


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

// Types for the new API response structure
interface PlanGym {
  plan_id: string;
  gym_id: number;
  price: number;
  description: string;
  title: string;
  duration: string;
  created_at: string;
  product_id_stripe: string;
  price_id_stripe: string;
  gym: {
    gym_id: number;
    location: string; // JSON string with lat/lng
    profile_img?: string | null;
    gym_name?: string;
    address?: string;
    contact_no?: string | null;
  };
}

interface MapGymData {
  gym: PlanGym['gym'];
  planType: 'oneDay' | 'other';
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
  const [mapGymsData, setMapGymsData] = useState<MapGymData[]>([])
  const [isLoadingMapData, setIsLoadingMapData] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [view, setView] = useState<"gyms" | "trainers">("gyms") // Toggle state
  const [showMapView, setShowMapView] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const hasDataFetched = useRef(false)

  const router = useRouter()

  useEffect(() => {
    // Prevent duplicate API calls
    if (hasDataFetched.current || isLoadingData) {
      return
    }
    
    hasDataFetched.current = true
    setIsLoadingData(true)

    console.log("Fetching gyms and trainers data...")

    // Fetch gym data from the backend
    const fetchGyms = axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/gym/getallgyms`)
      .then((response) => {
        console.log("Gyms API call completed")
        if (response.data && Array.isArray(response.data.gyms)) {
          setGyms(response.data.gyms)
          console.log("Fetched gyms:", response.data.gyms)
        } else {
          console.error("Unexpected gyms response format:", response.data)
          setGyms([])
        }
      }).catch((error) => {
        console.error("Error fetching gyms:", error)
        setGyms([])
      })

    // Fetch trainer data from the backend
    const fetchTrainers = axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/getalltrainers`)
      .then((response) => {
        console.log("Trainers API call completed")
        if (response.data && Array.isArray(response.data.trainers)) {
          setTrainers(response.data.trainers)
        } else {
          console.error("Unexpected trainers response format:", response.data)
          setTrainers([])
        }
      }).catch((error) => {
        console.error("Error fetching trainers:", error)
        setTrainers([])
      })

    // Wait for both API calls to complete
    Promise.all([fetchGyms, fetchTrainers]).finally(() => {
      setIsLoadingData(false)
      console.log("Data fetching completed")
    })

  }, [])

  // Get filtered gyms based on search criteria
  const getFilteredGyms = () => {
    return gyms.filter((gym) => {
      const matchesName = gym.gym_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLocation = !selectedLocation || 
        selectedLocation === "default" || 
        gym.address.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        (gym.location && gym.location.toLowerCase().includes(selectedLocation.toLowerCase()))
      return matchesName && matchesLocation
    })
  }

  // Handle "Find Near Me" button click
  const handleFindNearMe = async () => {
    if (view === "gyms") {
      setIsLoadingMapData(true)
      try {
        // Fetch both types of gyms for the map
        const [oneDayResponse, otherResponse] = await Promise.all([
          GetOneDayGyms(),
          GetOtherGyms()
        ])

        const mapData: MapGymData[] = []

        // Process one day gyms
        if (oneDayResponse?.gyms?.data) {
          oneDayResponse.gyms.data.forEach((planGym: PlanGym) => {
            mapData.push({
              gym: planGym.gym,
              planType: 'oneDay'
            })
          })
        }

        // Process other gyms
        if (otherResponse?.gyms?.data) {
          otherResponse.gyms.data.forEach((planGym: PlanGym) => {
            mapData.push({
              gym: planGym.gym,
              planType: 'other'
            })
          })
        }

        // Remove duplicates based on gym_id
        const uniqueMapData = mapData.reduce((acc, current) => {
          const existingIndex = acc.findIndex(item => item.gym.gym_id === current.gym.gym_id)
          if (existingIndex === -1) {
            acc.push(current)
          } else {
            // If gym already exists, prioritize 'oneDay' plan type
            if (current.planType === 'oneDay') {
              acc[existingIndex] = current
            }
          }
          return acc
        }, [] as MapGymData[])

        setMapGymsData(uniqueMapData)

        if (uniqueMapData.length === 0) {
          alert("No gyms with plans found. Please try again later.")
          setIsLoadingMapData(false)
          return
        }

        // Get user's location first
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              })
              setShowMapView(true)
              setIsLoadingMapData(false)
            },
            (error) => {
              // Handle geolocation error properly
              let errorMessage = 'Unknown error occurred'
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location access denied by user'
                  break
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information unavailable'
                  break
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out'
                  break
              }
              console.warn('Geolocation error:', errorMessage)
              // Show map anyway with default location (Colombo, Sri Lanka)
              setUserLocation({ lat: 6.9271, lng: 79.8612 })
              setShowMapView(true)
              setIsLoadingMapData(false)
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 600000
            }
          )
        } else {
          // Browser doesn't support geolocation, show map anyway
          console.warn('Geolocation not supported by this browser')
          setUserLocation({ lat: 6.9271, lng: 79.8612 })
          setShowMapView(true)
          setIsLoadingMapData(false)
        }
      } catch (error) {
        console.error("Error fetching gym data for map:", error)
        alert("Failed to load gym data for map view. Please try again.")
        setIsLoadingMapData(false)
      }
    } else {
      // For trainers, you could implement a different behavior or show a message
      alert("Map view is currently available for gyms only.")
    }
  }

  return (
    <div className="bg-black-400 min-h-screen">
    <div className="min-h-screen bg-black text-white">
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
            <Button onClick={handleFindNearMe} disabled={isLoadingMapData}>
              <MapPin className="mr-2 h-4 w-4" />
              {isLoadingMapData ? "Loading..." : "Find Near Me"}
            </Button>
          </div>
        </div>

        {/* Display Gym or Trainer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {view === "gyms" &&
            getFilteredGyms().map((gym) => <GymCard key={gym.gym_id} gym={gym} onClick={() => router.push(`/dashboard/user/gym/${gym.gym_id}`)} />)}

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

      {/* Map View Modal */}
      {showMapView && (
        <GymsMapView 
          mapGymsData={mapGymsData}
          onClose={() => setShowMapView(false)}
          userLocation={userLocation}
        />
      )}
    </div>
    </div>
  )
}