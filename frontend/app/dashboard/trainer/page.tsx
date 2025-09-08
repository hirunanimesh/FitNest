"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Statistics from "./_components/Statistics";
import UploadContent from "./_components/UploadContent";
import Calendar from "./_components/Calendar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MembershipGyms from "./_components/MembershipGyms";
const TrainerDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ProtectedRoute allowedRoles={['trainer']}>
      <div className="min-h-screen bg-transparent py-8">
        <div className="container mx-auto px-4 space-y-6">
          <section className="bg-transparent rounded-2xl p-4">
            <Statistics />
          </section>
           <MembershipGyms/>
          <section className="bg-transparent rounded-2xl p-4">
            <Calendar />
          </section>

          <section className="bg-gradient-to-r from-gray-800/50 to-transparent rounded-2xl p-4">
            <UploadContent />
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TrainerDashboard;