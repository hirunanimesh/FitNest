"use client";
import { Card, CardContent, CardHeader, CardTitle,CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";
import { useTrainerData } from '../context/TrainerContext';
import { BookSession } from "@/api/user/route";
import { useAuth } from "@/contexts/AuthContext";

export default function SessionsSection() {
  const { trainerData, isLoading, error } = useTrainerData();

  const sessions = trainerData?.sessions || [];
  const {getUserProfileId} = useAuth();

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

  const bookSession = async(sessionId:any) =>{
    try{
      const customerId = await getUserProfileId()
      const response = await BookSession(sessionId,customerId);
      console.log("Book session response:",customerId,sessionId);
      if(response.success){
        alert("Session booked successfully!");
        // Optionally, refresh the sessions or update state to reflect the booked status
      } else {
        alert("Failed to book session: " + response.error);
      }
    }catch(error){
      alert("An error occurred while booking the session: " + error);
    }
  }

  return (
    <section id="sessions" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent text-5xl md:text-5xl font-extrabold transform transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105 text-bold">
              Available Sessions</span>
          </h3>
         
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Book individual training sessions tailored to your unique needs and schedule
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sessions.map((session: any) => (
            <Card
              key={session.session_id}
              className="bg-gray-900 border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-red-500 h-full flex flex-col"
            >
              <CardHeader className="flex-shrink-0">
                
                
               
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-400">${session.price}</span></div>
                  <div><span className="text-lg text-gray-400">Duration: {session.duration}</span>
                </div>
                <div className="space-y-2 text-lg text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{session.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{session.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="w-5 h-5 flex-shrink-0" />
                    <span>Zoom Session</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
               
                <div className="flex-1">
                  <ul className="space-y-2 mb-4">
                    {session.features?.slice(0, 4).map((feature: string, index: number) => (
                      <li key={index} className="text-lg text-gray-400 flex items-start">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                        <span className="line-clamp-2">{feature}</span>
                      </li>
                    ))}
                    {session.features?.length > 4 && (
                      <li className="text-sm text-gray-500 italic">
                        +{session.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>
                <Button
                  onClick={() => bookSession(session.session_id)}
                  className={`w-full mt-auto ${
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