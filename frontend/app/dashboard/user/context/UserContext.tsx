"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GetCustomerById, GetLatestWeight, GetWeight } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  avatar: string;
  currentWeight: number | null;
  height: number | null;
  weightHistory: any[];
}

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  updateUserData: (newData: Partial<UserData>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { getUserProfileId } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false); // Prevent duplicate calls

  const fetchUserData = async () => {
    // Prevent multiple simultaneous calls
    if (isFetching) {
      console.log("🔄 Already fetching user data, skipping...");
      return;
    }
    
    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const customerId = await getUserProfileId();
      /*if (!customerId) {
        setIsLoading(false);
        return;
      }*/

      console.log("🔄 Fetching user data for ID:", customerId);

      // Fetch all data in parallel to reduce API calls
      const [customerResponse, latestWeightResponse, weightHistoryResponse] = await Promise.allSettled([
        GetCustomerById(customerId),
        GetLatestWeight(customerId),
        GetWeight(customerId)
      ]);

      let customer = null;
      let latestWeight = null;
      let weightHistory = [];

      // Process customer data
      if (customerResponse.status === 'fulfilled') {
        customer = customerResponse.value.user;
      }

      // Process latest weight data (optional)
      if (latestWeightResponse.status === 'fulfilled') {
        latestWeight = latestWeightResponse.value.weight;
      } else {
        console.log("UserContext: Latest weight request failed:", latestWeightResponse.reason);
        // For new users without weight data, this is expected
        latestWeight = null;
      }

      // Process weight history (optional)
      if (weightHistoryResponse.status === 'fulfilled') {
        console.log("UserContext: Raw weight response:", weightHistoryResponse.value);
        // GetWeight API returns response.data.weight as an array
        weightHistory = weightHistoryResponse.value.weight || [];
        console.log("UserContext: Weight history data:", weightHistory);
      } else {
        console.log("UserContext: Weight history request failed:", weightHistoryResponse.reason);
        // For new users without weight history, this is expected
        weightHistory = [];
      }

      if (customer) {
        const newUserData: UserData = {
          firstName: customer.first_name || "",
          lastName: customer.last_name || "",
          email: customer.email || "",
          phone: customer.phone_no || "",
          address: customer.address || "",
          dateOfBirth: customer.birthday || "",
          gender: customer.gender || "",
          avatar: customer.profile_img || "",
          currentWeight: latestWeight?.weight || null,
          height: latestWeight?.height || null,
          weightHistory: weightHistory
        };

        setUserData(newUserData);
        console.log("✅ User data loaded successfully");
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
      setIsFetching(false); // Reset fetching flag
    }
  };

  const refreshUserData = async () => {
    await fetchUserData();
  };

  const updateUserData = (newData: Partial<UserData>) => {
    setUserData(prev => prev ? { ...prev, ...newData } : null);
  };

  // Fetch data on mount and when auth changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      const customerId = await getUserProfileId();
      // Only fetch if component is still mounted and we have a customer ID
      if (isMounted && customerId && (!userData || userData === null)) {
        await fetchUserData();
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [getUserProfileId]); // Only re-run when getUserProfileId changes

  const value: UserContextType = {
    userData,
    isLoading,
    error,
    refreshUserData,
    updateUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within UserDataProvider");
  }
  return context;
};
