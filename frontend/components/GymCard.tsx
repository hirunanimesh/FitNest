"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Define the type for operating hours
interface OperatingHours {
  [key: string]: {
    open: string; 
    close: string; 
  };
}

// Updated Gym interface to include operating_Hours
interface Gym {
  gym_id: number;
  gym_name: string;
  profile_img?: string | null;
  description?: string | null;
  address: string;
  location: string;
  contact_no?: string | null;
  operating_Hours?: OperatingHours | null; // Added operating hours
}

interface GymCardProps {
  gym: Gym;
  onClick: () => void;
}

function getGymStatus(operating_Hours?: OperatingHours | string | null) {
  // Normalized return shape:
  // { status: 'Open' | 'Closed', opensAt?: string | null, closesAt?: string | null }
  if (!operating_Hours) return { status: "Closed", opensAt: null, closesAt: null };

  // If operating_Hours was stored as a JSON string, try to parse it
  let hoursObj: OperatingHours | null = null;
  if (typeof operating_Hours === "string") {
    try {
      hoursObj = JSON.parse(operating_Hours) as OperatingHours;
    } catch (e) {
      // fallback: not valid JSON
      hoursObj = null;
    }
  } else {
    hoursObj = operating_Hours as OperatingHours;
  }

  if (!hoursObj) return { status: "Closed", opensAt: null, closesAt: null };

  // Get today's day in lowercase, e.g., "monday"
  const now = new Date();
  const today = now.toLocaleString("en-US", { weekday: "long" }).toLowerCase();

  const todayHours = hoursObj[today];
  if (!todayHours) return { status: "Closed", opensAt: null, closesAt: null };

  const [openH, openM] = todayHours.open.split(":").map(Number);
  const [closeH, closeM] = todayHours.close.split(":").map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  // If open == close, assume 24/7 open
  if (openMinutes === closeMinutes) {
    return { status: "Open", opensAt: todayHours.open, closesAt: todayHours.close };
  }

  // Handle overnight hours (close next day)
  const isOvernight = closeMinutes <= openMinutes;

  let isOpen = false;
  if (isOvernight) {
    // Open from openMinutes -> midnight, and from 00:00 -> closeMinutes
    isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  } else {
    isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  if (isOpen) {
    return { status: "Open", opensAt: todayHours.open, closesAt: todayHours.close };
  }

  // Closed: if current time is before today's opening, provide opensAt for messaging
  if (!isOvernight && currentMinutes < openMinutes) {
    return { status: "Closed", opensAt: todayHours.open, closesAt: todayHours.close };
  }

  // Closed after closing (or in-between overnight closed window): we can provide closesAt for context
  return { status: "Closed", opensAt: null, closesAt: todayHours.close };
}

export default function GymCard({ gym, onClick }: GymCardProps) {
  const profileImg =
    gym.profile_img ||
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
  const { status, closesAt } = getGymStatus(gym.operating_Hours ?? undefined);


  return (
    <Card
      className="group bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/20 w-full max-w-sm mx-auto transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden animate-fade-in cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url('${profileImg}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
      </div>

      <CardContent className="relative p-6 space-y-3">
        <h3 className="text-xl font-bold text-white truncate group-hover:text-red-100 transition-colors">
          {gym.gym_name}
        </h3>

        <div className="flex items-center gap-2 text-sm text-slate-300 group-hover:text-red-100 transition-colors">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="truncate">{gym.address}</span>
        </div>

        {/*<div className="flex items-center gap-2 text-sm text-slate-300 group-hover:text-red-100 transition-colors">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span>{rating.toFixed(1)}</span>
          <span>({reviews} reviews)</span>
        </div>*/}

        {/* ✅ Display real-time Open/Closed status */}
        <div className="flex items-center justify-between text-sm">
          <span
            className={
              status === "Open"
                ? "text-green-500 font-medium"
                : "text-red-500 font-medium"
            }
          >
            {status}

            </span>
          <span className="text-slate-400 group-hover:text-red-100 transition-colors">
              {status === "Open"
                ? closesAt
                  ? `Closes at ${closesAt}`
                  : "Closing soon"
                : closesAt
                ? "Closed"
                : "Closed today"}
            </span>

        </div>
      </CardContent>
    </Card>
  );
  }

