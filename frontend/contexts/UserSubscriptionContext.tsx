"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GetUserSubscriptions, GetMyPlansDetails } from '@/api/user/route';
import { useAuth } from './AuthContext';

interface Plan {
  plan_id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  gym_plan_trainers: any[];
}

interface UserSubscriptionContextType {
  subscriptions: string[];
  planDetails: Plan[];
  isLoading: boolean;
  error: string | null;
  refreshSubscriptions: () => Promise<void>;
  hasSubscription: (planId: string) => boolean;
  hasGymAccess: (gymId: string, gymPlans?: any[]) => boolean;
}

const UserSubscriptionContext = createContext<UserSubscriptionContextType | undefined>(undefined);

export const useUserSubscriptions = () => {
  const context = useContext(UserSubscriptionContext);
  if (context === undefined) {
    throw new Error('useUserSubscriptions must be used within a UserSubscriptionProvider');
  }
  return context;
};

interface UserSubscriptionProviderProps {
  children: ReactNode;
}

export const UserSubscriptionProvider = ({ children }: UserSubscriptionProviderProps) => {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [planDetails, setPlanDetails] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { getUserProfileId } = useAuth();

  const fetchSubscriptions = async () => {
    if (isLoading) {
      console.log('[UserSubscriptionContext] Already loading, skipping fetch');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const customerId = await getUserProfileId();
      if (!customerId) {
        console.log('[UserSubscriptionContext] No customer ID found');
        setSubscriptions([]);
        setPlanDetails([]);
        setIsInitialized(true);
        return;
      }

      console.log('[UserSubscriptionContext] Fetching subscriptions for user:', customerId);
      
      // Get subscription plan IDs (will use cache if available)
      const subscriptionData = await GetUserSubscriptions(customerId);
      const planIds = Array.isArray(subscriptionData) ? subscriptionData : (subscriptionData?.planIds || []);
      
      setSubscriptions(planIds);

      // Get plan details if we have subscriptions (will use cache if available)
      if (planIds.length > 0) {
        const plansData = await GetMyPlansDetails(planIds);
        setPlanDetails(plansData.planDetails || []);
      } else {
        setPlanDetails([]);
      }

      console.log('[UserSubscriptionContext] Successfully loaded', planIds.length, 'subscriptions');
      setIsInitialized(true);
      
    } catch (err) {
      console.error('[UserSubscriptionContext] Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
      setSubscriptions([]);
      setPlanDetails([]);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscriptions = async () => {
    console.log('[UserSubscriptionContext] Manual refresh requested');
    await fetchSubscriptions();
  };

  const hasSubscription = (planId: string): boolean => {
    return subscriptions.includes(planId);
  };

  const hasGymAccess = (gymId: string, gymPlans?: any[]): boolean => {
    if (!gymPlans || gymPlans.length === 0) return false;
    
    const gymPlanIds = gymPlans.map(plan => plan.plan_id);
    return gymPlanIds.some(planId => subscriptions.includes(planId));
  };

  // Load subscriptions when component mounts
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted && !isInitialized && !isLoading) {
        console.log('[UserSubscriptionContext] Initial data load');
        await fetchSubscriptions();
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [isInitialized, isLoading]); // Only depend on initialization and loading state

  const value: UserSubscriptionContextType = {
    subscriptions,
    planDetails,
    isLoading,
    error,
    refreshSubscriptions,
    hasSubscription,
    hasGymAccess
  };

  return (
    <UserSubscriptionContext.Provider value={value}>
      {children}
    </UserSubscriptionContext.Provider>
  );
};