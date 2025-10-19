"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Clock,
  Star,
  Send,
  Search,
  Phone,
  Mail,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useTrainerData } from '../context/TrainerContext';
import { SendRequestToGym } from '@/lib/api';

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

const GymsPage = () => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Set<number>>(new Set());
  const [requestedGyms, setRequestedGyms] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const {trainerData,refreshTrainerData} = useTrainerData()
 
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    hasNext: false,
    total: 0,
    totalPages: 0
  });

  const fetchTrainerRequests = async () => {
    if (!trainerData?.trainer_id) return;
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/getmembershipgyms/${trainerData.trainer_id}`
      );
      
      if (response.data && response.data.gyms) {
        const gymIds = response.data.gyms.map((request: any) => request.gym_id);
        setRequestedGyms(new Set(gymIds));
      }
    } catch (error) {
      console.error("Error fetching trainer requests:", error);
      // Silently fail - this is not critical for the page to function
    }
  };

  useEffect(() => {
    fetchGyms(1, true);
    if (trainerData?.trainer_id) {
      fetchTrainerRequests();
    }
  }, [trainerData?.trainer_id]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery || selectedLocation) {
        fetchGyms(1, true, searchQuery, selectedLocation);
      } else {
        fetchGyms(1, true);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedLocation]);

  const fetchGyms = async (page: number, reset: boolean = false, search: string = "", location: string = "") => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

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

        setPagination({
          page: gymData.page,
          hasNext: gymData.hasNext,
          total: gymData.total,
          totalPages: gymData.totalPages
        });
      }
    } catch (error) {
      console.error("Error fetching gyms:", error);
      if (reset) {
        setGyms([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load gyms. Please try again."
        });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleViewMore = async () => {
    await fetchGyms(
      pagination.page + 1,
      false,
      searchQuery,
      selectedLocation
    );
  };

  // const handleSendRequest = async (gymId: number, gymName: string) => {
  //   setSendingRequests(prev => new Set(prev).add(gymId));

  //   try {
  //     // TODO: Replace with actual API call to send trainer request to gym
  //     await new Promise(resolve => setTimeout(resolve, 1500));

  //     toast({
  //       title: "Request Sent!",
  //       description: `Your request to join ${gymName} has been sent successfully.`
  //     });
  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Request Failed",
  //       description: `Failed to send request to ${gymName}. Please try again.`
  //     });
  //   } finally {
  //     setSendingRequests(prev => {
  //       const newSet = new Set(prev);
  //       newSet.delete(gymId);
  //       return newSet;
  //     });
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading gyms...</p>
        </div>
      </div>
    );
  }

  const sendRequest = async (gymId: number) => {
    // Add gym to sending requests set
    setSendingRequests(prev => new Set(prev).add(gymId));

    try {
      const response = await SendRequestToGym(trainerData?.trainer_id, gymId);
      if (response && response.message) {
        toast({
          title: "Request Sent!",
          description: response.message
        });
        
        // Add gym to requested set on successful send
        setRequestedGyms(prev => new Set(prev).add(gymId));
        await refreshTrainerData();
      }
    } catch (error: any) {
      console.error("Error sending request:", error);
      
      // Handle specific cases based on status code
      if (error.status === 409) {
        // 409 Conflict - Request already sent
        // Add to requested set since it exists
        setRequestedGyms(prev => new Set(prev).add(gymId));
        toast({
          variant: "default",
          title: "Already Sent",
          description: error.message || "Request already sent to this gym."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Request Failed",
          description: error.message || "Failed to send request. Please try again."
        });
      }
    } finally {
      // Remove gym from sending requests set
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(gymId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover <span className="text-red-500">Gyms</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find the perfect gym for your fitness journey. Browse through verified gyms and send join requests.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-2xl mx-auto mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search gyms by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:border-red-500 focus:ring-red-500 min-w-[180px]"
            >
              <option value="default">All Locations</option>
              {[
                "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
                "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
                "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
                "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
                "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
              ].map((location) => (
                <option key={location} value={location.toLowerCase()}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-gray-400">
            Showing {gyms.length} gym{gyms.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedLocation && selectedLocation !== "default" && ` in ${selectedLocation}`}
          </p>
        </div>

        {/* Gyms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <Card key={gym.gym_id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-red-500/50 transition-all duration-300 group h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={gym.profile_img || undefined} alt={gym.gym_name} />
                      <AvatarFallback className="bg-red-500/20 text-red-400">
                        {gym.gym_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-white text-lg group-hover:text-red-400 transition-colors">
                        {gym.gym_name}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                  {/* Description */}
                  <CardDescription 
                    className="text-gray-300 text-sm leading-relaxed overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical' as const,
                      maxHeight: '4.5em' // Fallback for 3 lines
                    }}
                  >
                    {gym.description || "A great place to achieve your fitness goals with professional guidance and modern equipment."}
                  </CardDescription>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{gym.address}</span>
                    </div>
                    {gym.contact_no && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{gym.contact_no}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Send Request Button - Always at bottom */}
                <div className="mt-4">
                  {requestedGyms.has(gym.gym_id) ? (
                    <Button
                      disabled
                      className="w-full bg-gray-600 text-gray-300 font-semibold py-2 cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Request Sent
                    </Button>
                  ) : (
                    <Button
                      onClick={() => sendRequest(gym.gym_id)}
                      disabled={sendingRequests.has(gym.gym_id)}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
                    >
                      {sendingRequests.has(gym.gym_id) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Request
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {pagination.hasNext && gyms.length > 0 && (
          <div className="text-center mt-8">
            <Button
              onClick={handleViewMore}
              disabled={loadingMore}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl px-8 py-3 font-semibold text-lg shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white mr-2"></Loader2>
                  Loading...
                </>
              ) : (
                "Load More Gyms"
              )}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {gyms.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No gyms found</h3>
            <p className="text-gray-500">
              {searchQuery || selectedLocation !== "default"
                ? "Try adjusting your search terms or location filter"
                : "No gyms are currently available"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymsPage;
