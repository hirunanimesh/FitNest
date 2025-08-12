"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SessionsSection() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchSessions = async () => {
      const trainerId = searchParams.get("id"); // Updated to fetch "id" from the URL
      console.log("Fetching sessions for trainerId:", trainerId);

      if (!trainerId) {
        console.error("Trainer ID is missing in the URL");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/getallsessionbytrainerid/${trainerId}`
        );
        console.log("Fetched sessions:", response.data);
        if (response.data && response.data.session) {
          setSessions(response.data.session);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, [searchParams]);

  return (
    <section id="sessions" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Available Sessions</h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Book individual training sessions tailored to your unique needs and schedule
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sessions.map((session) => (
            <Card
              key={session.session_id}
              className={`bg-gray-900 border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-red-500 ${
                selectedSession === session.session_id.toString() ? "ring-2 ring-red-500" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg text-white">{session.title}</CardTitle>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-400">${session.price}</span>
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
                <p className="text-gray-300 text-sm mb-4">{session.description}</p>
                <ul className="space-y-2 mb-4">
                  {session.features?.map((feature: string, index: number) => (
                    <li key={index} className="text-sm text-gray-400 flex items-center">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    session.booked ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={session.booked}
                >
                  {session.booked ? "Booked" : "Book Session"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}