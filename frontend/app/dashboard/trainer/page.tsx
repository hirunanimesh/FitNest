"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Statistics from "./_components/Statistics";
import UploadContent from "./_components/UploadContent";
import Calendar from "./_components/Calendar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const TrainerDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ProtectedRoute allowedRoles={['trainer']}>
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black/70 py-8">
        <div className="container mx-auto px-4 space-y-6">
          <section className="bg-gradient-to-r from-gray-900/60 to-transparent rounded-2xl p-4">
            <Statistics />
          </section>

          <section className="bg-gradient-to-r from-black/60 via-gray-900/30 to-transparent rounded-2xl p-4">
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