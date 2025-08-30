"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Statistics from "./_components/Statistics";
import Plans from "./_components/Plans";
import CreatePlan from "./_components/CreateSession";
import UploadContent from "./_components/UploadContent";
import Calendar from "./_components/Calendar";
import SideBar from "./_components/SideBar"; // Import your SideBar component
import { ProtectedRoute } from "@/components/ProtectedRoute";

const mockTrainer = {
  name: "John Doe",
  email: "john@fitnest.com",
};

const TrainerDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  return (
    <ProtectedRoute allowedRoles={['trainer']}>
      <div className="flex-1">
        <div className="flex-1 space-y-6 p-6">
          {/* display statistics */}
          <Statistics/>

          {/* Calendar Component */}
          <Calendar/>

          {/* trainer plans */}


          {/* create Plan */}
         

          {/* Trainer Content */}
          <UploadContent/>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TrainerDashboard;