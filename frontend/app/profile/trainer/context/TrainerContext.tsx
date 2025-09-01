"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

interface TrainerData {
  trainer_id: number;
  trainer_name: string;
  profile_img?: string | null;
  expertise: string;
  contact_no?: string | null;
  experience_years: number;
  email: string;
  skills: string | string[];
  bio: string;
  year_of_experience: number;
  rating: number;
}

interface TrainerContextType {
  trainerData: TrainerData | null;
  isLoading: boolean;
  error: string | null;
  refreshTrainerData: () => Promise<void>;
}

const TrainerContext = createContext<TrainerContextType | undefined>(undefined);

export function TrainerDataProvider({ children }: { children: React.ReactNode }) {
  const [trainerData, setTrainerData] = useState<TrainerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const trainerId = searchParams.get("id");
  const isFetching = useRef(false);

  const fetchTrainerData = async () => {
    if (!trainerId || isFetching.current) {
      return;
    }

    isFetching.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching trainer data for ID: ${trainerId}`);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/gettrainerbyid/${trainerId}`
      );
      
      if (response.data?.trainer) {
        setTrainerData(response.data.trainer);
        console.log("Trainer data fetched successfully:", response.data.trainer);
      } else {
        setError("Trainer not found");
        console.error("Unexpected response format:", response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch trainer data");
      console.error("Error fetching trainer data:", err);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  };

  const refreshTrainerData = async () => {
    isFetching.current = false; // Reset the flag to allow refresh
    await fetchTrainerData();
  };

  useEffect(() => {
    if (trainerId) {
      fetchTrainerData();
    }
  }, [trainerId]);

  const value: TrainerContextType = {
    trainerData,
    isLoading,
    error,
    refreshTrainerData,
  };

  return (
    <TrainerContext.Provider value={value}>
      {children}
    </TrainerContext.Provider>
  );
}

export function useTrainerData() {
  const context = useContext(TrainerContext);
  if (context === undefined) {
    throw new Error('useTrainerData must be used within a TrainerDataProvider');
  }
  return context;
}
