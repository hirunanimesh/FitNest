"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import GymCard from "@/components/GymCard";
import TrainerCard from "@/components/TrainerCard";
import GymsMapView from "@/components/GymsMapView";
import { useRouter } from "next/navigation";
import { GetOneDayGyms, GetOtherGyms } from "@/api/user/route";

// Type definitions
interface Gym {
  gym_id: number;
  gym_name: string;
  profile_img?: string | null;
  description?: string | null;
  address: string;
  location: string;
  contact_no?: string | null;
}

interface PaginatedGymResponse {
  data: Gym[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

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
    location: string;
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
  years_of_experience: number;
  email: string;
  skills: string | string[];
  bio: string;
  rating: number;
}

interface PaginatedTrainerResponse {
  data: Trainer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function SearchPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [mapGymsData, setMapGymsData] = useState<MapGymData[]>([]);
  const [isLoadingMapData, setIsLoadingMapData] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [view, setView] = useState<"gyms" | "trainers">("gyms");
  const [showMapView, setShowMapView] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Pagination states
  const [gymPagination, setGymPagination] = useState({
    page: 1,
    hasNext: false,
    total: 0,
    totalPages: 0
  });
  const [trainerPagination, setTrainerPagination] = useState({
    page: 1,
    hasNext: false,
    total: 0,
    totalPages: 0
  });

  const router = useRouter();

  // Initial data loading
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Refetch data when search or location changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery || selectedLocation) {
        fetchFilteredData();
      } else {
        fetchInitialData();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedLocation, view]);

  const fetchInitialData = async () => {
    setIsLoadingData(true);
    try {
      if (view === "gyms") {
        await fetchGyms(1, true);
      } else {
        await fetchTrainers(1, true);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchFilteredData = async () => {
    setIsLoadingData(true);
    try {
      if (view === "gyms") {
        await fetchGyms(1, true, searchQuery, selectedLocation);
      } else {
        await fetchTrainers(1, true, searchQuery);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchGyms = async (page: number, reset: boolean = false, search: string = "", location: string = "") => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(search && { search }),
        ...(location && location !== "default" && { location })
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/gym/getallgyms?${params}`
      );

      if (response.data && response.data.gyms) {
        const gymData: PaginatedGymResponse = response.data.gyms;
        
        if (reset) {
          setGyms(gymData.data);
        } else {
          setGyms(prev => [...prev, ...gymData.data]);
        }
        
        setGymPagination({
          page: gymData.page,
          hasNext: gymData.hasNext,
          total: gymData.total,
          totalPages: gymData.totalPages
        });
      }
    } catch (error) {
      console.error("Error fetching gyms:", error);
      if (reset) setGyms([]);
    }
  };

  const fetchTrainers = async (page: number, reset: boolean = false, search: string = "") => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(search && { search })
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/getalltrainers?${params}`
      );

      if (response.data && response.data.trainers) {
        const trainerData: PaginatedTrainerResponse = response.data.trainers;
        
        if (reset) {
          setTrainers(trainerData.data);
        } else {
          setTrainers(prev => [...prev, ...trainerData.data]);
        }
        
        setTrainerPagination({
          page: trainerData.page,
          hasNext: trainerData.hasNext,
          total: trainerData.total,
          totalPages: trainerData.totalPages
        });
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
      if (reset) setTrainers([]);
    }
  };

  const handleViewMore = async () => {
    setIsLoadingMore(true);
    try {
      if (view === "gyms") {
        await fetchGyms(
          gymPagination.page + 1, 
          false, 
          searchQuery, 
          selectedLocation
        );
      } else {
        await fetchTrainers(
          trainerPagination.page + 1, 
          false, 
          searchQuery
        );
      }
    } catch (error) {
      console.error("Error loading more data:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleFindNearMe = async () => {
    if (view === "gyms") {
      setIsLoadingMapData(true);
      try {
        const [oneDayResponse, otherResponse] = await Promise.all([GetOneDayGyms(), GetOtherGyms()]);

        const mapData: MapGymData[] = [];

        if (oneDayResponse?.gyms?.data) {
          oneDayResponse.gyms.data.forEach((planGym: PlanGym) => {
            mapData.push({
              gym: planGym.gym,
              planType: 'oneDay',
            });
          });
        }

        if (otherResponse?.gyms?.data) {
          otherResponse.gyms.data.forEach((planGym: PlanGym) => {
            mapData.push({
              gym: planGym.gym,
              planType: 'other',
            });
          });
        }

        const uniqueMapData = mapData.reduce((acc, current) => {
          const existingIndex = acc.findIndex((item) => item.gym.gym_id === current.gym.gym_id);
          if (existingIndex === -1) {
            acc.push(current);
          } else if (current.planType === 'oneDay') {
            acc[existingIndex] = current;
          }
          return acc;
        }, [] as MapGymData[]);

        setMapGymsData(uniqueMapData);

        if (uniqueMapData.length === 0) {
          alert("No gyms with plans found. Please try again later.");
          setIsLoadingMapData(false);
          return;
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              setShowMapView(true);
              setIsLoadingMapData(false);
            },
            (error) => {
              let errorMessage = 'Unknown error occurred';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location access denied by user';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information unavailable';
                  break;
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out';
                  break;
              }
              setUserLocation({ lat: 6.9271, lng: 79.8612 });
              setShowMapView(true);
              setIsLoadingMapData(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 600000,
            }
          );
        } else {
          setUserLocation({ lat: 6.9271, lng: 79.8612 });
          setShowMapView(true);
          setIsLoadingMapData(false);
        }
      } catch (error) {
        alert("Failed to load gym data for map view. Please try again.");
        setIsLoadingMapData(false);
      }
    } else {
      alert("Map view is currently available for gyms only.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-black">
            <span className="bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              Find Gyms & Trainers in Sri Lanka
            </span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Discover the best fitness centers and personal trainers to kickstart your fitness journey.
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={view === "gyms" ? "default" : "outline"}
            onClick={() => setView("gyms")}
            className={`px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300 ${
              view === "gyms"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:scale-105"
                : "bg-white/5 border-white/10 text-white hover:bg-red-500/20 hover:border-red-500/20"
            }`}
          >
            View Gyms
          </Button>
          <Button
            variant={view === "trainers" ? "default" : "outline"}
            onClick={() => setView("trainers")}
            className={`px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300 ${
              view === "trainers"
                ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:scale-105"
                : "bg-white/5 border-white/10 text-white hover:bg-red-500/20 hover:border-red-500/20"
            }`}
          >
            View Trainers
          </Button>
        </div>

        {/* Search Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in delay-200">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-red-500 focus:ring-red-500 rounded-xl py-6 text-lg"
          />
          {view==="gyms" && <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white focus:border-red-500 focus:ring-red-500 rounded-xl py-6">
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 text-white border-white/10">
              <SelectItem value="default">All Locations</SelectItem>
              {[
                "Ampara",
                "Anuradhapura",
                "Badulla",
                "Batticaloa",
                "Colombo",
                "Galle",
                "Gampaha",
                "Hambantota",
                "Jaffna",
                "Kalutara",
                "Kandy",
                "Kegalle",
                "Kilinochchi",
                "Kurunegala",
                "Mannar",
                "Matale",
                "Matara",
                "Moneragala",
                "Mullaitivu",
                "Nuwara Eliya",
                "Polonnaruwa",
                "Puttalam",
                "Ratnapura",
                "Trincomalee",
                "Vavuniya",
              ].map((location) => (
                <SelectItem key={location} value={location.toLowerCase()}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>}
          {view==="gyms" && <Button
            onClick={handleFindNearMe}
            disabled={isLoadingMapData}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl py-6 font-semibold text-lg shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105"
          >
            <MapPin className="mr-2 h-5 w-5" />
            {isLoadingMapData ? "Loading..." : "Find Near Me"}
          </Button>}
        </div>

        {/* Loading State */}
        {isLoadingData ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="w-16 h-16 border-4 border-red-500/30 rounded-full animate-spin border-t-red-500"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-rose-500/30 rounded-full animate-spin border-t-rose-500 animate-reverse"></div>
            </div>
            <p className="mt-4 text-lg text-slate-300">Loading gyms and trainers...</p>
          </div>
        ) : (
          <>
            {/* Gym/Trainer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {view === "gyms" &&
                gyms.map((gym) => (
                  <GymCard
                    key={gym.gym_id}
                    gym={gym}
                    onClick={() => router.push(`/dashboard/user/gym/${gym.gym_id}`)}
                  />
                ))}
              {view === "trainers" &&
                trainers.map((trainer) => (
                  <TrainerCard key={trainer.id} trainer={trainer} />
                ))}
            </div>

            {/* View More Button */}
            {((view === "gyms" && gymPagination.hasNext) || 
              (view === "trainers" && trainerPagination.hasNext)) && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleViewMore}
                  disabled={isLoadingMore}
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl px-8 py-3 font-semibold text-lg shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    "View More"
                  )}
                </Button>
              </div>
            )}

            {/* No Results Message */}
            {view === "gyms" && gyms.length === 0 && (
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 text-red-500 mx-auto" />
                <p className="mt-4 text-lg text-slate-300">No gyms found matching your criteria.</p>
              </div>
            )}
            {view === "trainers" && trainers.length === 0 && (
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 text-red-500 mx-auto" />
                <p className="mt-4 text-lg text-slate-300">No trainers found matching your criteria.</p>
              </div>
            )}
          </>
        )}

        {/* Map View Modal */}
        {showMapView && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Gyms Near You</h2>
                <Button
                  onClick={() => setShowMapView(false)}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full"
                >
                  Close
                </Button>
              </div>
              <GymsMapView
                mapGymsData={mapGymsData}
                onClose={() => setShowMapView(false)}
                userLocation={userLocation}
                
              />
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-reverse {
          animation: reverse 2s linear infinite;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}