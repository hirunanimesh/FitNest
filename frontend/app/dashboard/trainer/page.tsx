"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Statistics from "./_components/Statistics";
import Plans from "./_components/Plans";
import CreatePlan from "./_components/CreateSession";
import UploadContent from "./_components/UploadContent";
import Calendar from "./_components/Calendar";
import SideBar from "./_components/SideBar"; // Import your SideBar component

const mockTrainer = {
  name: "John Doe",
  email: "john@fitnest.com",
};

const TrainerDashboard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  return (
    
      <div className="flex-1">
        {/* <header className="flex h-16 items-center gap-2 border-b border-gray-800 px-4 bg-gray-800 text-white">
          <SidebarTrigger className="-ml-1 text-white hover:bg-gray-700 data-[state=open]:bg-gray-700" />
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Hi, {mockTrainer.name}</h1>
              <p className="text-sm text-gray-300">{today}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header> */}

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
    
  );
};

export default TrainerDashboard;