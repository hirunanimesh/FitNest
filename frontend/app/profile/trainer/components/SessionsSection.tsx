"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useTrainerData } from '../context/TrainerContext';
import { BookSession } from "@/api/user/route";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

// Type definitions
interface Session {
  session_id: string | number;
  price: number;
  duration: string;
  date: string;
  time: string;
  features?: string[];
  booked: boolean;
}

interface TrainerData {
  sessions: Session[];
  user_id: string;
}

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

// Toast Notification Component
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'info':
        return 'bg-blue-600 border-blue-500';
      default:
        return 'bg-gray-600 border-gray-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'info':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center space-x-3 ${getToastStyles()} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 min-w-80 max-w-md transform transition-all duration-300 ease-in-out`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-4 text-white hover:text-gray-200 transition-colors"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function SessionsSection(): JSX.Element {
  const { trainerData, isLoading, error } = useTrainerData();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [bookingStates, setBookingStates] = useState<Record<string | number, boolean>>({});

  const sessions: Session[] = (trainerData as TrainerData)?.sessions || [];
  const user_id: string = (trainerData as TrainerData)?.user_id;
  const { getUserProfileId } = useAuth();

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Auto dismiss after 5 seconds
  };

  const closeToast = () => {
    setToast(null);
  };

  if (isLoading) {
    return (
      <section id="sessions" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Available Sessions</h3>
            <div className="flex items-center justify-center space-x-2 text-gray-300">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-400"></div>
              <span>Loading sessions...</span>
            </div>
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
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 text-red-400">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span>Error loading sessions: {error}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const getUserEmail = async (): Promise<string | null> => {
    try {
      const response = await supabase.auth.getUser();
      if (response.data.user?.email) {
        console.log("User email:", response.data.user.email);
        return response.data.user.email;
      } else {
        console.log("No user logged in");
        return null;
      }
    } catch (error) {
      console.log("Error fetching user email:", error);
      return null;
    }
  };

  const bookSession = async (sessionId: string | number): Promise<void> => {
    // Set loading state for this specific session
    setBookingStates(prev => ({ ...prev, [sessionId]: true }));

    try {
      const email = await getUserEmail();
      const customerId = await getUserProfileId();
      
      if (!email) {
        showToast("Unable to retrieve your email address. Please ensure you're logged in.", 'error');
        return;
      }

      if (!customerId) {
        showToast("Unable to retrieve your profile information. Please try refreshing the page.", 'error');
        return;
      }

      if (!user_id) {
        showToast("Trainer information is not available. Please try again later.", 'error');
        return;
      }

      showToast("Processing your booking request...", 'info');

      const response = await BookSession(sessionId, customerId, user_id, email);
      console.log("Book session response:", customerId, sessionId, user_id, email);
      
      if (response?.url) {
        showToast("Booking successful! Redirecting to payment...", 'success');
        // Small delay to show success message before redirect
        setTimeout(() => {
          window.open(response.url, '_blank');
        }, 1000);
      } else {
        const errorMessage = response?.error || "An unexpected error occurred while booking your session.";
        showToast(`Booking failed: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error("Error booking session:", error);
      showToast("A technical error occurred while processing your booking. Please try again.", 'error');
    } finally {
      // Remove loading state for this session
      setBookingStates(prev => ({ ...prev, [sessionId]: false }));
    }
  };

  return (
    <>
      <section id="sessions" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent text-5xl md:text-5xl font-extrabold transform transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105">
                Available Sessions
              </span>
            </h3>
           
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Book individual training sessions tailored to your unique needs and schedule
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-8 max-w-md mx-auto">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-300 mb-2">No Sessions Available</h4>
                <p className="text-gray-400">Check back soon for new training sessions!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sessions.map((session: Session) => (
                <Card
                  key={session.session_id}
                  className="bg-gray-900 border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-red-500 h-full flex flex-col"
                >
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-400">${session.price}</span>
                    </div>
                    <div>
                      <span className="text-lg text-gray-400">Duration: {session.duration}</span>
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
                        {session.features && session.features.length > 4 && (
                          <li className="text-sm text-gray-500 italic">
                            +{session.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    </div>
                    <Button
                      onClick={() => bookSession(session.session_id)}
                      className={`w-full mt-auto ${
                        session.booked 
                          ? "bg-gray-600 cursor-not-allowed" 
                          : bookingStates[session.session_id]
                          ? "bg-blue-600 cursor-wait"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                      disabled={session.booked || bookingStates[session.session_id]}
                    >
                      {session.booked 
                        ? "Booked" 
                        : bookingStates[session.session_id]
                        ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Booking...</span>
                          </div>
                        )
                        : "Book Session"
                      }
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </>
  );
}