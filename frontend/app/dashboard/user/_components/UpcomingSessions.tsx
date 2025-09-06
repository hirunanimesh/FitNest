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

const UpcomingSessions = () => {
  // Mock session data
  const mockSessions: Session[] = [
    {
      id: 1,
      title: "Pilates Class",
      trainer: "Emily Davis",
      date: "2025-08-13",
      time: "9:00 AM",
      amount: "$18",
      image: "https://i.ibb.co/cK6cJtzx/34.webp",
      duration: "60 min",
    },
    {
      id: 2,
      title: "HIIT Workout",
      trainer: "Chris Brown",
      date: "2025-08-14",
      time: "11:00 AM",
      amount: "$22",
      image: "https://i.ibb.co/p6kqH3HW/hiit-workouts-for-men-blogheader-no-title.jpg",
       duration: "60 min",
    },
    {
      id: 3,
      title: "Zumba Dance",
      trainer: "Sophia Wilson",
      date: "2025-08-15",
      time: "5:00 PM",
      amount: "$20",
      image: "https://i.ibb.co/WNkwS13v/2149346546.webp",
       duration: "60 min",
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
    <section id="Today's Sessions" className=" bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">UpComing Sessions</h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">Your scheduled sessions for the coming days</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sessions.slice(0, 3).map((session) => (
            <Card 
              key={session.id} 
              className={`bg-gray-900 border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-red-500 ${
                selectedSession === session.id.toString() ? "ring-2 ring-red-500" : ""
              }`}
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
                    session.booked ? "bg-gray-600 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-500"
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

export default UpcomingSessions;