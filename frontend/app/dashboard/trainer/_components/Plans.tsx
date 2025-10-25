"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Save, X, Calendar } from "lucide-react";
import { useTrainerData } from '../context/TrainerContext';
import CreatePlan from './CreateSession';
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UpdateSessionDetails, DeleteSession } from "@/lib/api";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import VerifiedActions from '@/components/VerifiedActions';

interface Session {
  session_id: number;
  price: number;
  duration: string;
  date: string;
  time: string;
  features?: string[];
  booked?: boolean;
  zoom_link?: string;
  trainer: {
    trainer_name: string;
  };
}

// Skeleton loader component for sessions
const SessionSkeleton = () => (
  <div className="group relative p-2 rounded-xl">
    {/* Blurred glow effect */}
    <div
      className="absolute inset-0 rounded-xl -m-1 bg-gray-800/50 blur-lg opacity-60 z-0"
      aria-hidden
    />
    <Card className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-lg backdrop-blur-sm">
      <CardHeader>
        {/* Price skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-[60px] h-4 bg-gray-600 rounded animate-pulse" />
          <div className="h-4 bg-gray-700 rounded animate-pulse flex-1" />
        </div>
        
        {/* Duration skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-[60px] h-4 bg-gray-600 rounded animate-pulse" />
          <div className="h-4 bg-gray-700 rounded animate-pulse flex-1" />
        </div>
        
        {/* Date skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-[60px] h-4 bg-gray-600 rounded animate-pulse" />
          <div className="h-4 bg-gray-700 rounded animate-pulse flex-1" />
        </div>
        
        {/* Time skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-[60px] h-4 bg-gray-600 rounded animate-pulse" />
          <div className="h-4 bg-gray-700 rounded animate-pulse flex-1" />
        </div>
        
        {/* Zoom link skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-[80px] h-4 bg-gray-600 rounded animate-pulse" />
          <div className="h-4 bg-gray-700 rounded animate-pulse flex-1" />
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex gap-2 mt-3">
          <div className="h-8 bg-gray-600 rounded animate-pulse flex-1" />
          <div className="h-8 bg-gray-600 rounded animate-pulse flex-1" />
        </div>
      </CardHeader>
    </Card>
  </div>
);

// Loading state component
const LoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <SessionSkeleton key={index} />
    ))}
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 px-8">
    <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-xl mb-6">
      <Calendar className="w-12 h-12 text-white" />
    </div>
    <h3 className="text-2xl font-bold text-red-400 mb-4">No Sessions Available</h3>
    <p className="text-red-300 text-center max-w-md leading-relaxed mb-6">
      You haven't created any training sessions yet. Start scheduling sessions to connect with your clients and help them achieve their fitness goals.
    </p>
    <p className="text-sm text-gray-400">Click "Create Session" to get started</p>
  </div>
);

export default function Plans() {
  const { toast } = useToast();
  const { trainerData, refreshTrainerData, isLoading } = useTrainerData();
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Session>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);

  // Sessions from trainer context (default to empty array)
  const sessions: Session[] = trainerData?.sessions || [];

  // Start editing a session
  const handleEdit = (session: Session) => {
    setEditingSessionId(session.session_id);
    setEditFormData({
      price: session.price,
      duration: session.duration,
      date: session.date,
      time: session.time,
      zoom_link: session.zoom_link,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditFormData({});
  };

  // Save edits
  const handleSaveEdit = async (sessionId: number) => {
    const updatedData = {
      price: editFormData.price,
      duration: editFormData.duration,
      date: editFormData.date,
      time: editFormData.time,
      zoom_link: editFormData.zoom_link,
    };
    try {
      await UpdateSessionDetails(sessionId, updatedData);
      setEditingSessionId(null);
      setEditFormData({});
      await refreshTrainerData();
      toast({
        title: "Session updated",
        description: "Session details have been updated successfully."
      });
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message
          ? `Error: ${error.message} (Status: ${error.status || error.response?.status || "unknown"})`
          : "Failed to update session. Please try again."
      });
    }
  };

  // Delete session
  const openDeleteModal = (sessionId: number) => {
    setSessionToDelete(sessionId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSessionToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    if (sessionToDelete !== null) {
      try {
        await DeleteSession(sessionToDelete);
        await refreshTrainerData();
        toast({
          title: "Session deleted",
          description: "Session has been deleted successfully."
        });
      } catch (error) {
        console.error('Error deleting session:', error);
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: "Failed to delete session. Please try again."
        });
      }
      closeDeleteModal();
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isEditing = (sessionId: number) => editingSessionId === sessionId;

  return (
    <>
      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-gray-700 items-center justify-center text-lg">
          <div className="text-white text-center mb-4">
            Are you sure you want to delete this session?
          </div>
          <DialogFooter>
            <div className="flex justify-center gap-x-8 w-full">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                className="bg-gray-600 text-white border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-600 text-white border-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section id="sessions">
        <div className="container mx-auto px-4">
          <div className='flex flex-row justify-between items-center'>
            <div className="flex-1 flex justify-center items-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white text-center mb-6 md:mb-10">
                Ongoing Sessions
              </h2>
            </div>
            <div className="ml-4 hidden sm:block">
              <CreatePlan />
            </div>
          </div>

          {/* Mobile create button */}
          <div className="flex justify-center mb-6 sm:hidden">
            <CreatePlan />
          </div>

          {/* Content section with loading, empty, and data states */}
          {isLoading ? (
            <LoadingState />
          ) : sessions && sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sessions.map((session: Session) => (
              <div key={session.session_id} className="group relative p-2 rounded-xl">
                {/* blurred red glow */}
                <div
                  className="absolute inset-0 rounded-xl -m-1 bg-red-900/70 blur-lg opacity-80 transition-opacity duration-300 group-hover:opacity-100 z-0"
                  aria-hidden
                />
                <Card className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-lg transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-red-500/20 group-hover:border-red-500/50 group-hover:ring-2 group-hover:ring-red-500/20 backdrop-blur-sm">
                  <CardHeader>
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-white min-w-[60px]">Price:</Label>
                      {isEditing(session.session_id) ? (
                        <Input
                          type="number"
                          value={editFormData.price || ''}
                          onChange={(e) => handleInputChange('price', Number(e.target.value))}
                          className="bg-[#192024] text-white border-gray-600 flex-1"
                        />
                      ) : (
                        <span className="text-sm text-white flex-1">${session.price}</span>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-white min-w-[60px]">Duration:</Label>
                      {isEditing(session.session_id) ? (
                        <Select
                          value={editFormData.duration || ''}
                          onValueChange={(value) => handleInputChange('duration', value)}
                        >
                          <SelectTrigger className="col-span-3 bg-gray-800 text-white">
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
                      ) : (
                        <span className="text-sm text-white flex-1">{session.duration}</span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-white min-w-[60px]">Date:</Label>
                      {isEditing(session.session_id) ? (
                        <Input
                          type="date"
                          value={editFormData.date || ''}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          className="col-span-3 bg-gray-800 border-gray-700 text-white"
                        />
                      ) : (
                        <span className="text-sm text-white flex-1">{session.date}</span>
                      )}
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-white min-w-[60px]">Time:</Label>
                      {isEditing(session.session_id) ? (
                        <Input
                          type="time"
                          value={editFormData.time || ''}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          className="col-span-3 bg-gray-800 border-gray-700 text-white"
                        />
                      ) : (
                        <span className="text-sm text-white flex-1">{session.time}</span>
                      )}
                    </div>

                    {/* Zoom Link */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-white min-w-[80px]">Zoom:</Label>
                      {isEditing(session.session_id) ? (
                        <Input
                          type="url"
                          value={editFormData.zoom_link || ''}
                          onChange={(e) => handleInputChange('zoom_link', e.target.value)}
                          className="bg-[#192024] text-white border-gray-600 flex-1"
                        />
                      ) : (
                        <span className="text-sm text-white flex-1 truncate">{session.zoom_link}</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      {isEditing(session.session_id) ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white border-gray-600"
                          >
                            <X className="w-4 h-4 mr-2" /> Cancel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveEdit(session.session_id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white border-green-600"
                          >
                            <Save className="w-4 h-4 mr-2" /> Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <VerifiedActions fallbackMessage="You need to be a verified trainer to edit sessions.">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(session)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                            >
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </Button>
                          </VerifiedActions>
                          <VerifiedActions fallbackMessage="You need to be a verified trainer to delete sessions.">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(session.session_id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                          </VerifiedActions>
                        </>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </div>
            ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </>
  );
}
