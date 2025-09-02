"use client";
import { Card, CardContent, CardHeader, CardTitle,CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";
import { useTrainerData } from '../context/TrainerContext';

export default function SessionsSection() {
  const { trainerData, isLoading, error } = useTrainerData();

  const sessions = trainerData?.sessions || [];

  if (isLoading) {
    return (
      <section id="sessions" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Available Sessions</h3>
            <div className="text-gray-300">Loading sessions...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="sessions" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Available Sessions</h3>
            <div className="text-red-400">Error loading sessions: {error}</div>
          </div>
        </div>
      </section>
    );
  }

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
          {sessions.map((session: any) => (
            <Card
              key={session.session_id}
              className="bg-gray-900 border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-red-500"
            >
              <CardHeader>
                 <img
                    src={session.img_url || "/placeholder.svg"}
                    alt={session.title}
                    className="w-full h-full object-cover rounded-md mb-2"
                  />
                <CardTitle className="text-lg text-white">{session.title}</CardTitle>
                <CardDescription>with:  {session.trainer.trainer_name}</CardDescription>
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