import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Session {
  id: number;
  title: string;
  trainer: string;
  date: string;
  time: string;
  amount: string;
  description: string;
  image?: string;
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
      description: "A relaxing yoga session to improve flexibility.",
      image: "https://i.ibb.co/R11mNDs/beginners-yoga-class-BUQX8-HA.jpg",
    },
    {
      id: 2,
      title: "Strength Training",
      trainer: "Mike Johnson",
      date: "2025-08-12",
      time: "2:00 PM",
      amount: "$25",
      description: "Build strength and endurance with this session.",
      image: "https://i.ibb.co/xKsmf57J/2.webp",
    },
    {
      id: 3,
      title: "Cardio Blast",
      trainer: "Sarah Lee",
      date: "2025-08-12",
      time: "6:00 PM",
      amount: "$15",
      description: "An intense cardio session to boost your stamina.",
      image: "https://i.ibb.co/8L82YtGc/3.webp",
    },
  ];

  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    // Simulate fetching data with mock data
    setTimeout(() => {
      setSessions(mockSessions);
    }, 500); // Simulate a delay
  }, []);

  return (
    <section id ="Today's Sessions">
      <Card className="bg-dark text-white">
        <CardHeader>
          <CardTitle >Today's Sessions</CardTitle>
          <CardDescription className="text-white">Your scheduled workout sessions for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sessions.slice(0, 3).map((session) => (
              <Card key={session.id} className="border-l-4 border-l-primary bg-[#192024] text-white">
                <CardHeader className="pb-2">
                  <img
                    src={session.image || "/placeholder.svg"}
                    alt={session.title}
                    className="w-full h-full object-cover rounded-md mb-2"
                  />
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription>with {session.trainer}</CardDescription>
                </CardHeader>
                <CardContent >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <Badge variant="outline">{session.date}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground ">Time:</span>
                      <Badge variant="outline">{session.time}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <Badge variant="default" className="bg-green-500">
                        {session.amount}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{session.description}</p>
                    <Button size="sm" className="w-full mt-3">
                      Join Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default TodaySessions;