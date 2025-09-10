import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";

interface Session {
  id: number;
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
      trainer: "Ravindu Perera",
      date: "2025-10-13",
      time: "9:00 AM",
      amount: "$18",
      image: "https://i.ibb.co/0R2WW6tx/1.webp",
      duration: "30 min",
    },
    {
      id: 2,
      trainer: "Sashini Jayawardena",
      date: "2025-10-14",
      time: "11:00 AM",
      amount: "$22",
      image: "https://i.ibb.co/Fk2HW1GT/6.webp",
       duration: "60 min",
    },
    {
      id: 3,
      trainer: "Chathura Gunasekara",
      date: "2025-10-15",
      time: "5:00 PM",
      amount: "$20",
      image: "https://i.ibb.co/YFcV9mPp/4.webp",
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
    <section id="Today's Sessions">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-gray-300">
            UpComming Sessions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sessions.slice(0, 3).map((session) => (
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
                  className="w-full h-72 object-cover rounded-md mb-2"
                />
                <CardDescription className="text-gray-400">with: {session.trainer}</CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-400">{session.amount}</span></div>
                  <div><span className="text-sm text-gray-400">Duraion: {session.duration}</span>
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