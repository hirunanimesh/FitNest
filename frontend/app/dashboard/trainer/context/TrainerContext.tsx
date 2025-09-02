"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GetTrainerById } from '@/lib/api';

interface TrainerData {
  trainer_id: number;
  trainer_name: string;
  profile_img?: string | null;
  contact_no?: string | null;
  email: string;
  bio: string;
  years_of_experience: number;
  rating: number;
  verified: boolean;
  skills: string[];
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
  const [isFetching, setIsFetching] = useState(false); // Prevent duplicate calls
  const { user, session, getUserProfileId } = useAuth();

  const fetchTrainerData = async () => {
    // Prevent multiple simultaneous calls
    if (isFetching) {
      console.log("🔄 Already fetching trainer data, skipping...");
      return;
    }
    
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching trainer data for user ID:', user?.id);
      
      // Get trainer ID directly from AuthContext
      const trainerId = await getUserProfileId();
      
      if (!trainerId) {
        setError("Trainer ID not found");
        return;
      }

      // Get trainer profile data using the API function
      const trainerProfileData = await GetTrainerById(trainerId);

        if (trainerProfileData?.trainer) {
          const trainer = trainerProfileData.trainer;
          
          const trainerData: TrainerData = {
            trainer_id: trainer.trainer_id || trainer.id,
            trainer_name: trainer.trainer_name,
            profile_img: trainer.profile_img || trainer.profile_image_url,
            contact_no: trainer.contact_no || trainer.contact_number,
            email: user?.email || trainer.email,
            bio: trainer.bio || '',
            years_of_experience: trainer.years_of_experience || trainer.experience || 0,
            rating: trainer.rating || 0,
            verified: trainer.verified || false,
            skills: Array.isArray(trainer.skills) ? trainer.skills : (trainer.skills ? trainer.skills.split(',') : [])
          };

          setTrainerData(trainerData);
          console.log('Trainer data loaded successfully:', trainerData);
        } else {
          setError("Trainer profile not found");
          console.error("No trainer profile data available");
        }
    } catch (err: any) {
      setError(err.message || "Failed to fetch trainer data");
      console.error("Error fetching trainer data:", err);
      
      // If API fails, you can optionally still show a basic fallback
      if (user?.email) {
        const fallbackData: TrainerData = {
          trainer_id: 0,
          trainer_name: "Trainer",
          profile_img: null,
          contact_no: null,
          email: user.email,
          bio: "",
          years_of_experience: 0,
          rating: 0,
          verified: false,
          skills: []
        };
        setTrainerData(fallbackData);
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const refreshTrainerData = async () => {
    await fetchTrainerData();
  };

  useEffect(() => {
    if (user?.id && session) {
      fetchTrainerData();
    }
  }, [user?.id, session]);

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
