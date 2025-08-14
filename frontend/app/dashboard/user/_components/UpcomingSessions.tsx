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
      description: "A low-impact class to improve posture and core strength.",
      image: "https://i.ibb.co/cK6cJtzx/34.webp",
    },
    {
      id: 2,
      title: "HIIT Workout",
      trainer: "Chris Brown",
      date: "2025-08-14",
      time: "11:00 AM",
      amount: "$22",
      description: "A high-intensity interval training session to burn calories.",
      image: "https://i.ibb.co/2F3k9kH/hiit-workout.jpg",
    },
    {
      id: 3,
      title: "Zumba Dance",
      trainer: "Sophia Wilson",
      date: "2025-08-15",
      time: "5:00 PM",
      amount: "$20",
      description: "A fun and energetic dance workout to improve fitness.",
      image: "https://i.ibb.co/4p3z4kP/zumba-dance.jpg",
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
    <section id ="Upcoming Sessions">
      <Card className="bg-black text-white">
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Your scheduled sessions for the coming days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="border-l-4 border-l-primary bg-[#192024] text-white">
                <CardHeader className="pb-2">
                  <img
                    src={session.image || "/placeholder.svg"}
                    alt={session.title}
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription>with {session.trainer}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <Badge variant="outline">{session.date}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Time:</span>
                      <Badge variant="outline">{session.time}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <Badge variant="default" className="bg-green-500">
                        {session.amount}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{session.description}</p>
                    <Button size="sm" className="w-full mt-3 bg-red" variant="outline">
                      View Details
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

export default UpcomingSessions;