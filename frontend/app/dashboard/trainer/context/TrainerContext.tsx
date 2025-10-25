"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GetTrainerById } from '@/lib/api';
import axios from 'axios';
interface TrainerData {
  trainer_id: number;
  trainer_name: string;
  profile_img: string | null;
  contact_no: string | null;
  email: string;
  bio: string;
  years_of_experience: number;
  verified: boolean;
  skills: string[];
  documents?: any; // JSONB from DB, could be array/object
  sessions?: any[];
  plans?: any[];
  totalSessionCount?: number;
  totalPlanCount?: number;
  
}

interface TrainerContextType {
  trainerData: TrainerData | null;
  isLoading: boolean;
  error: string | null;
  refreshTrainerData: () => Promise<void>;
  setDocuments?: (docs: any) => void;
  addDocument?: (doc: any) => void;
  removeDocument?: (indexOrId: number | string) => void;
  saveDocuments?: () => Promise<void>;
}

const TrainerContext = createContext<TrainerContextType | undefined>(undefined);

export function TrainerDataProvider({ children }: { children: React.ReactNode }) {
  const [trainerData, setTrainerData] = useState<TrainerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false); // Prevent duplicate calls
  const [documents, setDocuments] = useState<any[] | object | null>(null);
  const { user, session, getUserProfileId } = useAuth();

  const fetchTrainerData = async () => {
    // Prevent multiple simultaneous calls
    if (isFetching) {
      console.log(" Already fetching trainer data, skipping...");
      return;
    }
    
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching trainer data for user ID:', user?.id);
      
      // Get trainer ID directly from AuthContext
      const trainerId = await getUserProfileId();
      const [ sessionsResponse ] = await Promise.allSettled([
        axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/getallsessionbytrainerid/${trainerId}`),
      ]);
      const[plansResponse] = await Promise.allSettled([
        axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/getallplansbytrainerid/${trainerId}`),
      ]);
      
       let sessions: any[] = [];
       let plans: any[] = [];

       let totalSessionCount = 0;
       let totalPlanCount = 0;

if (sessionsResponse.status === 'fulfilled' && sessionsResponse.value.data?.sessions) {
  sessions = sessionsResponse.value.data.sessions;
  totalSessionCount = sessionsResponse.value.data.totalCount || 0;
  console.log("Sessions data fetched successfully:", sessions, "Total:", totalSessionCount);


    } else {
      console.log("Sessions data request failed or no sessions found:", 
        sessionsResponse.status === 'rejected' ? sessionsResponse.reason : "No sessions data");
    }
    if (plansResponse.status === 'fulfilled' && (plansResponse.value.data?.plans)) {
      plans = plansResponse.value.data.plans;
      totalPlanCount = plansResponse.value.data.totalCount || 0;
      console.log("Plans data fetched successfully:", plans, "Total:", totalPlanCount);
      
    } else {
      console.log("Plans data request failed or no plans found:", 
        plansResponse.status === 'rejected' ? plansResponse.reason : "No plans data");
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
            verified: trainer.verified || false,
            skills: (() => {
              if (Array.isArray(trainer.skills)) {
                return trainer.skills;
              }
              if (typeof trainer.skills === 'string') {
                // Try to parse as JSON first
                try {
                  const parsed = JSON.parse(trainer.skills);
                  if (Array.isArray(parsed)) {
                    return parsed;
                  }
                } catch (e) {
                  // If JSON parsing fails, try splitting by comma
                  return trainer.skills.split(',').map((skill: string) => skill.trim());
                }
              }
              return [];
            })(),
            documents: (() => {
              // trainer.documents stored as JSONB in DB; could be an object, array, or stringified JSON
              if (trainer.documents === undefined || trainer.documents === null) return null;
              if (typeof trainer.documents === 'string') {
                try {
                  return JSON.parse(trainer.documents);
                } catch (e) {
                  // If it's a plain string, return as-is
                  return trainer.documents;
                }
              }
              return trainer.documents;
            })(),
            sessions: sessions,
            plans: plans,
            totalSessionCount: totalSessionCount,
            totalPlanCount: totalPlanCount,
            
          };

          // seed local documents state
          setDocuments(trainerData.documents ?? null);

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
          verified: false,
          skills: [],
          documents: null,
          sessions: [],
          plans: [],
          
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

  // document helpers exposed to consumers
  const setDocumentsWrapper = (docs: any) => {
    setDocuments(docs);
    setTrainerData((prev) => prev ? { ...prev, documents: docs } : prev);
  };

  const addDocument = (doc: any) => {
    setDocuments((prev: any) => {
      let next: any;
      if (Array.isArray(prev)) next = [...prev, doc];
      else if (prev === null) next = [doc];
      else next = [prev, doc];
      setTrainerData((t) => t ? { ...t, documents: next } : t);
      return next;
    });
  };

  const removeDocument = (indexOrId: number | string) => {
    setDocuments((prev: any) => {
      if (!Array.isArray(prev)) return prev;
      const next = prev.filter((d: any, i: number) => (typeof indexOrId === 'number' ? i !== indexOrId : d.id !== indexOrId));
      setTrainerData((t) => t ? { ...t, documents: next } : t);
      return next;
    });
  };

  const saveDocuments = async () => {
    if (!trainerData) throw new Error('No trainer data to update');
    try {
      // call API helper to persist documents
      const payload = { documents };
      const { UpdateTrainerDetails } = await import('@/lib/api');
      await UpdateTrainerDetails(trainerData.trainer_id, payload);
      // refresh trainer data after save
      await refreshTrainerData();
    } catch (err) {
      console.error('Failed to save documents', err);
      throw err;
    }
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
  setDocuments: setDocumentsWrapper,
  addDocument,
  removeDocument,
  saveDocuments,
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