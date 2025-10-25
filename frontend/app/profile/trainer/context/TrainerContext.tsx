"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

interface TrainerData {
  id: string;
  user_id:string,
  trainer_name: string;
  profile_img?: string | null;
  expertise: string;
  contact_no?: string | null;
  years_of_experience: number;
  email: string;
  skills: string | string[];
  bio: string;
  sessions?: any[];
  feedbacks?: any[];
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
      
      // Fetch all trainer data in parallel to reduce API calls
      const [trainerResponse, sessionsResponse, feedbackResponse] = await Promise.allSettled([
        axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/gettrainerbyid/${trainerId}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/getallsessionbytrainerid/${trainerId}`),
        axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/getfeedbackbytrainerid/${trainerId}`)
      ]);

      let trainer = null;
      let sessions: any[] = [];
      let feedbacks: any[] = [];

      // Process trainer data
      if (trainerResponse.status === 'fulfilled' && trainerResponse.value.data?.trainer) {
        trainer = trainerResponse.value.data.trainer;
      } else {
        console.error("Trainer data request failed:", trainerResponse.status === 'rejected' ? trainerResponse.reason : "No trainer data");
      }

      // Process sessions data (handle both 'sessions' and legacy 'session' keys)
      if (sessionsResponse.status === 'fulfilled') {
        const resp = sessionsResponse.value.data || {};
        // Backend uses 'sessions' (plural); older endpoints may return 'session'
        sessions = resp.sessions ?? resp.session ?? [];
        console.log("Sessions data fetched successfully:", sessions);
      } else {
        console.log("Sessions data request failed or no sessions found:", sessionsResponse.status === 'rejected' ? sessionsResponse.reason : "No sessions data");
      }

      // Process feedback data
      if (feedbackResponse.status === 'fulfilled' && feedbackResponse.value.data?.trainer) {
        feedbacks = feedbackResponse.value.data.trainer;
        console.log("Feedback data fetched successfully:", feedbacks);
      } else {
        console.log("Feedback data request failed or no feedback found:", feedbackResponse.status === 'rejected' ? feedbackResponse.reason : "No feedback data");
      }

      if (trainer) {
        const trainerDataWithExtras: TrainerData = {
          ...trainer,
          sessions,
          feedbacks
        };
        
        setTrainerData(trainerDataWithExtras);
        console.log("Trainer data with sessions and feedback loaded successfully:", trainerDataWithExtras);
      } else {
        setError("Trainer not found");
        console.error("No trainer data available");
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
