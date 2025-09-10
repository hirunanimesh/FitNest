import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {Dialog,DialogContent,DialogFooter,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { AddSession } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

interface Session {
  session_id?: number;
  trainer_id: number;
  price: number;
  time: string;
  duration: string;
  zoom_link: string;
  date: string;
  product_id_stripe?: string;
  price_id_stripe?: string;
  booked: boolean;
  users: string[];
}

const CreateSession = () => {
  const { toast } = useToast();
  const { getUserProfileId } = useAuth();
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    price: 0,
    time: "",
    duration: "",
    zoom_link: "",
    date: "",
    trainer_id: 1,
    booked: false,
    product_id_stripe: "",
    price_id_stripe: "",
  });

  useEffect(() => {
    const setTrainerIdInForm = async () => {
      const trainerId = await getUserProfileId();
      if (trainerId) {
        setSessionForm(prev => ({
          ...prev,
          trainer_id: trainerId
        }));
      }
    };
    setTrainerIdInForm();
  }, [getUserProfileId]);

  const date = sessionForm.date ? new Date(sessionForm.date) : null;

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sessionForm.price <= 0 || !sessionForm.time || !sessionForm.duration || !sessionForm.date) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    setIsCreatingSession(true);

    try {
      const trainerId = await getUserProfileId();
      if (!trainerId) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Unable to get trainer ID. Please log in again."
        });
        return;
      }

      const sessionData = {
        trainer_id: trainerId,
        price: sessionForm.price,
        time: sessionForm.time,
        duration: sessionForm.duration,
        zoom_link: sessionForm.zoom_link,
        date: sessionForm.date,
        booked: false,
      };

      const response = await AddSession(sessionData);

      const newSession: Session = {
        session_id: response.session_id || Date.now(),
        ...sessionData,
        users: [],
      };
      setSessions((prev) => [...prev, newSession]);

      setSessionForm({
        price: 0,
        time: "",
        duration: "",
        zoom_link: "",
        date: "",
        trainer_id: trainerId,
        booked: false,
        product_id_stripe: "",
        price_id_stripe: "",
      });

      setIsSessionDialogOpen(false);

      toast({
        title: "Success!",
        description: "Session created successfully!"
      });

    } catch (error: any) {
      console.error('Error creating session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to create session. Please try again.'
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div>
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="text-xs px-1 sm:px-2 md:px-3 h-7 sm:h-8 md:h-9 w-full sm:w-auto"
          >
            <Plus className="h-3 w-3 mr-1" />
            Create New Session
          </Button>
        </DialogTrigger>
        <DialogContent className='bg-gray-800 text-white max-w-md sm:max-w-lg md:max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Create New Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSessionSubmit}>
            <div className="grid gap-3 sm:gap-4 py-4">
              {/* Price */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="price" className="text-left sm:text-right text-sm sm:text-base">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="1"
                  min="0"
                  value={sessionForm.price}
                  onChange={(e) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0
                    }))
                  }
                  className="col-span-1 sm:col-span-3 bg-gray-800 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="time" className="text-left sm:text-right text-sm sm:text-base">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={sessionForm.time}
                  onChange={(e) =>
                    setSessionForm((prev) => ({ ...prev, time: e.target.value }))
                  }
                  className="col-span-1 sm:col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark] text-sm sm:text-base"
                  required
                />
              </div>

              {/* Date */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="date" className="text-left sm:text-right text-sm sm:text-base">
                  Date <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-1 sm:col-span-3 space-y-2">
                  <Input
                    id="date"
                    type="date"
                    value={sessionForm.date}
                    onChange={(e) =>
                      setSessionForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark] text-sm sm:text-base"
                    required
                  />
                  {date && (
                    <p className="text-xs sm:text-sm text-gray-400">
                      Selected:{" "}
                      {date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="duration" className="text-left sm:text-right text-sm sm:text-base">
                  Duration
                </Label>
                <Select
                  value={sessionForm.duration}
                  onValueChange={(value) =>
                    setSessionForm((prev) => ({ ...prev, duration: value }))
                  }
                >
                  <SelectTrigger className="col-span-1 sm:col-span-3 bg-gray-800 text-sm sm:text-base">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white">
                    <SelectItem value="30 min">30 min</SelectItem>
                    <SelectItem value="45 min">45 min</SelectItem>
                    <SelectItem value="1 hr">1 hr</SelectItem>
                    <SelectItem value="1 hr 30 min">1 hr 30 min</SelectItem>
                    <SelectItem value="2 hr">2 hr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Zoom Link */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="zoom_link" className="text-left sm:text-right text-sm sm:text-base">
                  Zoom Link
                </Label>
                <Input
                  id="zoom_link"
                  type="url"
                  value={sessionForm.zoom_link}
                  onChange={(e) =>
                    setSessionForm((prev) => ({ ...prev, zoom_link: e.target.value }))
                  }
                  className="col-span-1 sm:col-span-3 bg-gray-800 text-sm sm:text-base"
                  placeholder="https://zoom.us/j/..."
                  required
                />
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="submit"
                disabled={isCreatingSession}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {isCreatingSession ? "Creating..." : "Create Session"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateSession;
