import React from 'react'
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';

interface Session {
    session_id?: number;
    trainer_id: number;
    title: string;
    description: string;
    price: number;
    time: string; // HH:MM format for time input
    duration: string;
    zoom_link: string;
    img_url: string;
    date: string; // YYYY-MM-DD format for date input
    product_id_stripe?: string;
    price_id_stripe?: string;
    booked: boolean;
    users: string[]; // Array of user IDs or names
  }

const CreateSession = () => {
    const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [sessionForm, setSessionForm] = useState({
        title: "",
        description: "",
        price: 0,
        time: "",
        duration: "",
        zoom_link: "",
        img_url: "",
        date: "",
        trainer_id: 1, // This should be set from the current logged-in trainer
        booked: false,
        product_id_stripe: "",
        price_id_stripe: "",
      });

    // Handle date input and create Date object for display
    const handleDateInputChange = (value: string) => {
        setSessionForm((prev) => ({ ...prev, date: value }));
    };

    const date = sessionForm.date ? new Date(sessionForm.date) : null;

    const handleSessionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newSession: Session = {
          session_id: Date.now(),
          ...sessionForm,
          users: [],
        };
        setSessions((prev) => [...prev, newSession]);
        setSessionForm({ 
          title: "", 
          description: "", 
          price: 0,
          time: "", 
          duration: "", 
          zoom_link: "",
          img_url: "",
          date: "",
          trainer_id: 1,
          booked: false,
          product_id_stripe: "",
          price_id_stripe: "",
        });
        setIsSessionDialogOpen(false);
      };

  return (
    <div>
       <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Create New Session
                </Button>
              </DialogTrigger>
              <DialogContent className='bg-gray-800 text-white'>
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSessionSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right ">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={sessionForm.title}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="col-span-3 bg-gray-800"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={sessionForm.description}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="col-span-3 bg-gray-800"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={sessionForm.price}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="col-span-3 bg-gray-800"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="time" className="text-right">
                        Time
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={sessionForm.time}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, time: e.target.value }))}
                        className="col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <div className="col-span-3 space-y-2">
                        <Input
                          id="date"
                          type="date"
                          value={sessionForm.date}
                          onChange={(e) => handleDateInputChange(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]"
                          required
                        />
                        {date && (
                          <p className="text-sm text-gray-400">
                            Selected: {date.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">
                        Duration
                      </Label>
                      <Select
                        value={sessionForm.duration}
                        onValueChange={(value) => setSessionForm((prev) => ({ ...prev, duration: value }))}
                      >
                        <SelectTrigger className="col-span-3 bg-gray-800">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className='bg-gray-800 text-white'>
                          <SelectItem value="30 min">30 min</SelectItem>
                          <SelectItem value="45 min">45 min</SelectItem>
                          <SelectItem value="1 hr">1 hr</SelectItem>
                          <SelectItem value="1 hr 30 min">1 hr 30 min</SelectItem>
                          <SelectItem value="2 hr">2 hr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="zoom_link" className="text-right">
                        Zoom Link
                      </Label>
                      <Input
                        id="zoom_link"
                        type="url"
                        value={sessionForm.zoom_link}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, zoom_link: e.target.value }))}
                        className="col-span-3 bg-gray-800"
                        placeholder="https://zoom.us/j/..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="img_url" className="text-right">
                        Image URL
                      </Label>
                      <Input
                        id="img_url"
                        type="url"
                        value={sessionForm.img_url}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, img_url: e.target.value }))}
                        className="col-span-3 bg-gray-800"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Session</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
    </div>
  )
}

export default CreateSession

