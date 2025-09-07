import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";

interface Session {
  id: number;
  title: string;
  trainer: string;
  date: string;
  time: string;
  amount: string;
  image?: string;
  duration?: string;
  booked?: boolean;
}

const TodaySessions = () => {
  // Mock session data
  const mockSessions: Session[] = [
    {
      id: 1,
      title: "Yoga Class",
      trainer: "Jane Smith",
      date: "2025-08-12",
      time: "10:00 AM",
      amount: "$20",
      image: "https://i.ibb.co/R11mNDs/beginners-yoga-class-BUQX8-HA.jpg",
      duration: "60 min",
     
    },
    {
      id: 2,
      title: "Strength Training",
      trainer: "Mike Johnson",
      date: "2025-08-12",
      time: "2:00 PM",
      amount: "$25",
      image: "https://i.ibb.co/xKsmf57J/2.webp",
      duration: "45 min",
    },
    {
      id: 3,
      title: "Cardio Blast",
      trainer: "Sarah Lee",
      date: "2025-08-12",
      time: "6:00 PM",
      amount: "$15",
      image: "https://i.ibb.co/8L82YtGc/3.webp",
      duration: "30 min",
    },
    {
      id: 4,
      title: "HIIT Blast",
      trainer: "Banula Lakvidu Hettiarachchi",
      date: "2025-08-12",
      time: "8:00 PM",
      amount: "$25",
      image: "https://i.ibb.co/WN3ZMzDf/hit-blust.jpg",
      duration: "45 min",
    },
  ];

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching data with mock data
    setTimeout(() => {
      setSessions(mockSessions);
    }, 500); // Simulate a delay
  }, []);

  return (
    <section id="Today's Sessions" className="bg-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-10">
            <span className="bg-gradient-to-r from-blue-800 via-rose-400 to-blue-800 bg-clip-text text-transparent">Today's Sessions</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sessions.slice(0, 4).map((session) => (
            <Card
              key={session.id}
              className={`relative bg-gray-900 border border-red-500 transition-all  group flex flex-col overflow-hidden
                ${selectedSession === session.id.toString()
                  ? "ring-4 ring-red-500 shadow-[0_0_24px_6px_rgba(239,68,68,0.8)] "
                  : "shadow-[0_0_12px_2px_rgba(239,68,68,0.5)]"
                }
                hover:border-red-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105`}
              style={{ boxShadow: selectedSession === session.id.toString() ? "0 0 24px 6px rgba(239,68,68,0.8), 0 0 40px 10px rgba(255,0,0,0.4)" : "0 0 12px 2px rgba(239,68,68,0.5)" }}
            >
              <CardHeader>
                <img
                  src={session.image || "/placeholder.svg"}
                  alt={session.title}
                  className="w-full h-full object-cover rounded-md mb-2"
                />
                <CardTitle className="text-lg text-white">{session.title}</CardTitle>
                <CardDescription className="text-gray-400">with: {session.trainer}</CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-400">{session.amount}</span>
                  <span className="text-sm text-gray-400">{session.duration}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4" />
                    <span>Zoom Session</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className={`w-full ${
                    session.booked ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={session.booked}
                  onClick={() => setSelectedSession(session.id.toString())}
                >
                  { "Join Session"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TodaySessions;