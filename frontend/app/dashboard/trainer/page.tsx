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
      <div className="space-y-6">
        {/* display statistics */}
        <Statistics/>

        {/* Calendar Component */}
        <Calendar/>

        {/* trainer plans */}


        {/* create Plan */}
       

        {/* Trainer Content */}
        <UploadContent/>
      </div>
    </ProtectedRoute>
  );
};

export default TrainerDashboard;