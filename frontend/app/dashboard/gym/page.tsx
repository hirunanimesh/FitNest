"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemberTab from "./_components/MemberTab";
import TrainerTab from "./_components/TrainerTab";
import PlansTab from "./_components/PlansTab";
import Statistics from "./_components/Statistics";
import { Button } from "@/components/ui/button";
import MonthlyRevenueChart from "./_components/MonthlyRevenueChart";
import MonthlyMemberCountChart from "./_components/MonthlyMemberCountChart";
import PaymentHistory from "./_components/PaymentHistory";

import { useGym } from "./context/GymContext";
import { supabase } from "@/lib/supabase";
import { GetGymProfileData } from "@/lib/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CreateAccount, GetDashboardLink } from "@/api/gym/route";

// Stripe Account Setup Modal Component
interface StripeAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
  isCreating: boolean;
}

const StripeAccountModal: React.FC<StripeAccountModalProps> = ({ isOpen, onClose, onCreateAccount, isCreating }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Stripe Account Required
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            You need to create a Stripe account to receive payments from gym memberships and services. This will allow you to manage your earnings and process member payments securely.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={onCreateAccount}
              disabled={isCreating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create Stripe Account"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GymDashboard() {
  const { setGymId, setUserId } = useGym();
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [hasCheckedStripe, setHasCheckedStripe] = useState(false);
  const [mounted, setMounted] = useState(false);

  const getSession = async (): Promise<string | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }
    return data.session?.user.id || null;
  };

  const getUserId = async (): Promise<string | null> => {
    try {
      const session = await supabase.auth.getSession();
      if (session?.data?.session?.user?.id) {
        return session.data.session.user.id;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  const createAccount = async (): Promise<void> => {
    try {
      setIsCreatingAccount(true);
      const userId = await getUserId();
      const response = await CreateAccount(userId);
      if (response && response.data.url) {
        window.open(response.data.url, '_blank');
        setShowStripeModal(false);
        // Check again after account creation
        setTimeout(() => {
          checkHaveStripeAccount();
        }, 2000);
      } else {
        console.error("Failed to create Stripe account");
        alert("Failed to create Stripe account. Please try again.");
      }
    } catch (error) {
      console.error("Error creating Stripe account:", error);
      alert("Error creating Stripe account. Please try again.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const checkHaveStripeAccount = async (): Promise<void> => {
    try {
      const userId = await getUserId();
      if (userId) {
        const response = await GetDashboardLink(userId);
        if (response && !response.data.founded) {
          setShowStripeModal(true);
        }
        setHasCheckedStripe(true);
      }
    } catch (error) {
      console.error("Error checking Stripe account:", error);
      setHasCheckedStripe(true);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchGymId = async () => {
      const user_id = await getSession();
      setUserId(user_id || null);
      try {
        const response = await GetGymProfileData(user_id);
        if (response) {
          console.log(response.gym);
          setGymId(response.gym.gym_id);
        } else {
          console.error("No response fetch");
        }
      } catch (error) {
        console.log("Error fetching data", error);
      }
    };
    fetchGymId();
  }, [setGymId, setUserId]);

  useEffect(() => {
    if (mounted && !hasCheckedStripe) {
      checkHaveStripeAccount();
    }
  }, [mounted, hasCheckedStripe]);

  return (
    <ProtectedRoute allowedRoles={['gym','admin']}>
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto p-6">
          {/* Stats Overview */}
          <Statistics />

          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full bg-gray-700 text-white grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-12 sm:mb-16 md:mb-10 gap-1">
              <TabsTrigger value="analytics" className="text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="members" className="text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900">
                Members
              </TabsTrigger>
              <TabsTrigger value="trainers" className="text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900">
                Trainers
              </TabsTrigger>
              <TabsTrigger value="plans" className="text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900">
                Gym Plans
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-900">
                Payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              <MonthlyRevenueChart />
              <MonthlyMemberCountChart />
            </TabsContent>

            <TabsContent value="members" className="space-y-6 pt-4">
              <MemberTab />
            </TabsContent>

            <TabsContent value="trainers" className="space-y-6 pt-4">
              <TrainerTab />
            </TabsContent>

            <TabsContent value="plans" className="space-y-6 pt-4">
              <PlansTab />
            </TabsContent>

            <TabsContent value="payments" className="space-y-6 pt-4">
              <PaymentHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Stripe Account Setup Modal */}
      <StripeAccountModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        onCreateAccount={createAccount}
        isCreating={isCreatingAccount}
      />
    </ProtectedRoute>
  );
}