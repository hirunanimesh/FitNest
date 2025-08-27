"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface GymContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
  gymId: string | null;
  setGymId: (id: string | null) => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [gymId, setGymId] = useState<string | null>(null);

  return (
    <GymContext.Provider value={{ userId, setUserId, gymId, setGymId }}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error("useGym must be used within GymProvider");
  }
  return context;
};
