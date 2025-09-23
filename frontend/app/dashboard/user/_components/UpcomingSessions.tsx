import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GetUserSessions } from "@/api/user/route";

interface Session {
  session_id: number;
  created_at: string;
  trainer_id: number;
  price: number;
  date: string;
  time: string;
  zoom_link: string;
  booked: boolean;
  duration: string;
  customer_id: number;
  lock: boolean;
  trainer: {
    profile_img: string;
    trainer_name: string;
  };
}

const UpcomingSessions = () => {
  const { getUserProfileId } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const customerId = await getUserProfileId();
      const response = await GetUserSessions(customerId);
      
      console.log("Fetched sessions:", response.sessions);
      
      if (response.sessions && Array.isArray(response.sessions)) {
        setSessions(response.sessions);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to fetch sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Handle join session
  const handleJoinSession = (session: Session) => {
    setSelectedSession(session.session_id.toString());
    if (session.zoom_link) {
      window.open(session.zoom_link, '_blank');
    }
  };

  if (loading) {
    return (
      <section id="Today's Sessions">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-gray-300">
              Upcoming Sessions
            </h2>
          </div>
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              {/* Animated loader */}
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto">
                  {/* Outer spinning ring */}
                  <div className="absolute inset-0 border-4 border-red-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-red-500 rounded-full animate-spin"></div>
                  
                  {/* Inner pulsing dot */}
                  <div className="absolute inset-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                
                {/* Floating particles */}
                <div className="absolute -top-2 -left-2 w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="absolute -top-4 left-8 w-1.5 h-1.5 bg-red-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                <div className="absolute -bottom-4 right-8 w-1.5 h-1.5 bg-red-300 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
              </div>
              
              {/* Loading text with animation */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-200">Loading Your Sessions</h3>
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-gray-400">Fetching your training schedule</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                    <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
              
              {/* Loading skeleton cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-900/50 border border-red-500/20 rounded-lg p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-800/50 rounded-md mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-800/50 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-800/50 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-800/50 rounded w-2/3"></div>
                      <div className="h-8 bg-gray-800/50 rounded w-full mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="Today's Sessions">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-gray-300">
              Upcoming Sessions
            </h2>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-red-400">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="Today's Sessions">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 text-gray-300">
            Upcoming Sessions
          </h2>
        </div>
        
        {sessions.length === 0 ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center p-8 bg-gray-900/50 rounded-2xl border border-red-500/30 backdrop-blur-sm max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border border-red-500/40">
                  <Calendar className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-200 mb-2">No Sessions Scheduled</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  You don't have any upcoming training sessions at the moment. 
                </p>
              </div>
              <div className="space-y-3 text-sm text-gray-500">
                <p className="flex items-center justify-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>Ready for your next workout?</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Book a session with our expert trainers</span>
                </p>
              </div>
              <div className="mt-6">
                <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-red-500/25">
                  Browse Trainers
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sessions.slice(0, 3).map((session) => (
              <Card
                key={session.session_id}
                className={`relative bg-gray-900 border border-red-500 transition-all group flex flex-col overflow-hidden
                  ${selectedSession === session.session_id.toString()
                    ? "ring-4 ring-red-500 shadow-[0_0_24px_6px_rgba(239,68,68,0.8)]"
                    : "shadow-[0_0_12px_2px_rgba(239,68,68,0.5)]"
                  }
                  hover:border-red-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105`}
                style={{
                  boxShadow: selectedSession === session.session_id.toString()
                    ? "0 0 24px 6px rgba(239,68,68,0.8), 0 0 40px 10px rgba(255,0,0,0.4)"
                    : "0 0 12px 2px rgba(239,68,68,0.5)"
                }}
              >
                <CardHeader>
                  <img
                    src={session.trainer.profile_img || "/placeholder.svg"}
                    alt={session.trainer.trainer_name}
                    className="w-full h-72 object-cover rounded-md mb-2"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <CardDescription className="text-gray-400">
                    with: {session.trainer.trainer_name}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-400">
                      ${session.price}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">
                      Duration: {session.duration}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(session.time)}</span>
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
                      session.booked && session.lock
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-500"
                    }`}
                    disabled={session.booked && session.lock}
                    onClick={() => handleJoinSession(session)}
                  >
                    {session.booked ? "Join Session" : "Book Session"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcomingSessions;