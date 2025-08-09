"use client"

import { useState, useEffect } from "react"
import {Home, User, Users, Phone} from 'lucide-react'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import axios from "axios"
import { Card, CardContent} from "@/components/ui/card"
import SideBar from "./_components/SideBar"
import TopBar from "./_components/TopBar"
import Progress from "./_components/Progress"
import TodaySessions from "./_components/TodaySessions"
import UpcomingSessions from "./_components/UpcomingSessions"
import KPI from "./_components/KPI"
import Charts from "./_components/Charts"
import Schedule from "./_components/Schedule"

const motivationQuotes = [
  "Every workout counts towards your goal!",
  "Consistency is the key to success!",
  "Your only limit is your mind!",
  "Push yourself because no one else will!"
]

const sidebarItems = [
  { title: "Home", icon: Home, url: "/", isActive: true },
  { title: "Profile", icon: User, url: "user/profile/1" },
  { title: "Search", icon: Users, url: "user/search" },
  { title: "Contacts", icon: Phone, url: "#" }
]

function AnimatedQuote({ quote }: { quote: string }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < quote.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + quote[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, quote])

  useEffect(() => {
    setDisplayedText("")
    setCurrentIndex(0)
  }, [quote])

  return <p className="text-2xl font-bold text-primary italic">{displayedText}</p>
}

// Define or import the missing types
interface User {
  id: number;
  name: string;
  avatar?: string;
}

export default function UserDashboard() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchUserAndSessions = async () => {
  //     try {
  //       const userResponse = await axios.get<User>(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/customer`);
  //       setUser(userResponse.data);

  //       const sessionsResponse = await axios.get<Session[]>(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/gym/subscribe`, {
  //         params: { userId: userResponse.data.id },
  //       });
  //       setSessions(sessionsResponse.data);

  //       setLoading(false);
  //     } catch (err) {
  //       console.error("Error fetching data:", err);
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserAndSessions();
  // }, []);

  // useEffect(() => {
  //   const fetchBmiData = async () => {
  //     try {
  //       const response = await axios.get<ProgressEntry[]>(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/user/progress`, {
  //         params: { userId: user?.id },
  //       });

  //       const bmiValues = response.data.map((entry) => {
  //         const heightInMeters = entry.height / 100; // Convert height to meters
  //         const bmi = entry.weight / (heightInMeters * heightInMeters);
  //         return { day: entry.date, bmi: parseFloat(bmi.toFixed(1)) }; // Round BMI to 1 decimal place
  //       });

  //       setBmiData(bmiValues);
  //     } catch (err) {
  //       console.error("Error fetching BMI data:", err);
  //     }
  //   };

  //   if (user?.id) {
  //     fetchBmiData();
  //   }
  // }, [user]);

  // useEffect(() => {
  //   const fetchWeightData = async () => {
  //     try {
  //       const response = await axios.get<ProgressEntry[]>(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/user/progress`, {
  //         params: { userId: user?.id },
  //       });

  //       const weightValues = response.data.map((entry) => ({
  //         day: entry.date,
  //         weight: entry.weight,
  //       }));

  //       setWeightData(weightValues);
  //     } catch (err) {
  //       console.error("Error fetching weight data:", err);
  //     }
  //   };

  //   if (user?.id) {
  //     fetchWeightData();
  //   }
  // }, [user]);

  // Ensure the theme is properly initialized and debug the toggle functionality
  // useEffect(() => {
  //   if (!mounted) {
  //     setMounted(true);
  //   }
  // }, [mounted]);

  // useEffect(() => {
  //   setMounted(true);
  //   const interval = setInterval(() => {
  //     setCurrentQuote((prev) => (prev + 1) % motivationQuotes.length);
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  // if (!mounted || loading) return <p>Loading...</p>;


  

  return (
    <SidebarProvider>

      <SideBar/>

      <SidebarInset className="flex">
        <div className="flex-1">
          {/* Header */}
          <TopBar/>

          {/* Main Content */}
          <div className="flex-1 space-y-6 p-6">
            {/* Motivation Quote */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <AnimatedQuote quote={motivationQuotes[currentQuote]} />
              </CardContent>
            </Card>

            {/* Streak Card */}
            <Progress/>

            {/* Today's Sessions */}
            <TodaySessions/>

            {/* Upcoming Sessions */}
            <UpcomingSessions/>

            {/* KPI Results */}
              <KPI/>

            {/* Charts */}
            <Charts/>
          </div>
        </div>

        {/* Right Sidebar */}
        <Schedule/>

      </SidebarInset>
    </SidebarProvider>
  );
}