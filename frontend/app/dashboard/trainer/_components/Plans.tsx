"use client";
import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Save, X, ImagePlus } from "lucide-react";
import { useTrainerData } from '../context/TrainerContext';
import CreatePlan from './CreateSession';
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { UpdateSessionDetails,DeleteSession,uploadToCloudinary } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";

interface Session {
  session_id: number;
  title: string;
  img_url?: string;
  price: number;
  duration: string;
  date: string;
  time: string;
  description: string;
  features?: string[];
  booked?: boolean;
  zoom_link?: string;
  trainer: {
    trainer_name: string;
  };
}

export default function Plans() {
  const { toast } = useToast();
  const { trainerData, refreshTrainerData } = useTrainerData();
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Session>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessions: Session[] = trainerData?.sessions || [];

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);

  // Upload image to Cloudinary (or your backend)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/uploadsessionimage`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );
      return response.data.imageUrl || response.data.url || response.data.secure_url;
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw new Error(error.response?.data?.message || 'Image upload failed');
    }
  };

  // Handle image file selection
  const handleImageSelect = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select an image smaller than 10MB"
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  // Handle drag events for image upload
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageSelect(files[0]);
    }
  }, [handleImageSelect]);

  // Start editing a session
  const handleEdit = (session: Session) => {
    setEditingSessionId(session.session_id);
    setEditFormData({
      title: session.title,
      price: session.price,
      duration: session.duration,
      date: session.date,
      time: session.time,
      description: session.description,
      img_url: session.img_url,
      zoom_link: session.zoom_link,
    });
    setSelectedImage(null);
    setImagePreview("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditFormData({});
    setSelectedImage(null);
    setImagePreview("");
  };

  // Save edits, including image upload if changed
  const handleSaveEdit = async (sessionId: number) => {
    try {
      let img_url = editFormData.img_url;
      if (selectedImage) {
        setIsUploadingImage(true);
        img_url = await uploadToCloudinary(selectedImage);
        setIsUploadingImage(false);
      }
      const updatedData = { ...editFormData, img_url };

      // Debug: log endpoint and payload
      console.log("UpdateSessionDetails called with:", sessionId, updatedData);

      await UpdateSessionDetails(sessionId, updatedData);

      setEditingSessionId(null);
      setEditFormData({});
      setSelectedImage(null);
      setImagePreview("");
      await refreshTrainerData();
      toast({
        title: "Session updated",
        description: "Session details have been updated successfully."
      });
    } catch (error: any) {
      setIsUploadingImage(false);
      console.error('Error updating session:', error);

      // Show more error details in toast
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message 
          ? `Error: ${error.message} (Status: ${error.status || error.response?.status || "unknown"})`
          : "Failed to update session. Please try again."
      });
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (sessionId: number) => {
    setSessionToDelete(sessionId);
    setShowDeleteModal(true);
  };

  // Close modal
  const closeDeleteModal = () => {
    setSessionToDelete(null);
    setShowDeleteModal(false);
  };

  // Confirm delete
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
          <div className='flex flex-row justify-between'>
            <div className="flex-1 flex justify-center items-center">
              <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-10">
                    <span className="bg-gradient-to-r from-dark-700 via-rose-400 to-black-600 bg-clip-text text-transparent">Ongoing Sessions</span></h2>
            </div>
            <CreatePlan />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sessions.map((session: Session) => (
              <div key={session.session_id} className="group relative p-2 rounded-xl">
                {/* blurred red glow behind card */}
                <div className="absolute inset-0 rounded-xl -m-1 bg-red-900/70 blur-lg opacity-80 transition-opacity duration-300 group-hover:opacity-100 z-0" aria-hidden />
                <Card className="relative z-10 bg-gray-800 border-gray-700 transition-all duration-200 transform group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:border-red-500 group-hover:ring-1 group-hover:ring-red-600 group-hover:ring-offset-2 group-hover:ring-offset-slate-900">
                <CardHeader>
                  <div className="relative">
                    <div
                      className={`w-full h-full rounded-md mb-2 overflow-hidden border-2 ${isDragging ? "border-blue-500" : "border-transparent"}`}
                      onDragOver={isEditing(session.session_id) ? handleDragOver : undefined}
                      onDragLeave={isEditing(session.session_id) ? handleDragLeave : undefined}
                      onDrop={isEditing(session.session_id) ? handleDrop : undefined}
                    >
                      <img
                        src={
                          isEditing(session.session_id)
                            ? imagePreview || editFormData.img_url || "/placeholder.svg"
                            : session.img_url || "/placeholder.svg"
                        }
                        alt={session.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    {isEditing(session.session_id) && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-700 text-white border-gray-600 hover:bg-gray-800"
                          onClick={() => fileInputRef.current?.click()}
                          type="button"
                          disabled={isUploadingImage}
                        >
                          <ImagePlus className="w-4 h-4 mr-2" />
                          {isUploadingImage ? "Uploading..." : "Change Image"}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileInputChange}
                          disabled={isUploadingImage}
                        />
                      </div>
                    )}
                  </div>

                  {/* Title Field */}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-white min-w-[60px]">Title:</Label>
                    {isEditing(session.session_id) ? (
                      <Input
                        value={editFormData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="bg-[#192024] text-white border-gray-600 flex-1"
                      />
                    ) : (
                      <span className="text-sm text-white flex-1">{session.title}</span>
                    )}
                  </div>

                  {/* Price Field */}
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
                      <span className="text-sm text-white flex-1">Rs.{session.price}</span>
                    )}
                  </div>

                  {/* Duration Field */}
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

                  {/* Date Field */}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-white min-w-[60px]">Date:</Label>
                    {isEditing(session.session_id) ? (
                      <Input
                        type="date"
                        value={editFormData.date || ''}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]"
                      />
                    ) : (
                      <span className="text-sm text-white flex-1">{session.date}</span>
                    )}
                  </div>

                  {/* Time Field */}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-white min-w-[60px]">Time:</Label>
                    {isEditing(session.session_id) ? (
                      <Input
                        type="time"
                        value={editFormData.time || ''}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className="col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]"
                      />
                    ) : (
                      <span className="text-sm text-white flex-1">{session.time}</span>
                    )}
                  </div>
                  {/* Zoom Field */}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-white min-w-[60px]">Zoom Link:</Label>
                    {isEditing(session.session_id) ? (
                      <Input
                        type="url"
                        value={editFormData.zoom_link || ''}
                        onChange={(e) => handleInputChange('zoom_link', e.target.value)}
                        className="bg-[#192024] text-white border-gray-600 flex-1"
                      />
                    ) : (
                      <span className="text-sm text-white flex-1">{session.zoom_link}</span>
                    )}
                  </div>
                  {/* Description Field */}
                  <div className="flex items-start gap-2">
                    <Label className="text-sm text-white min-w-[60px] pt-2">Description:</Label>
                    {isEditing(session.session_id) ? (
                      <Textarea
                        value={editFormData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="bg-[#192024] text-white border-gray-600 min-h-[60px] flex-1"
                        rows={3}
                      />
                    ) : (
                      <span className="text-sm text-white flex-1">{session.description}</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {session.features?.map((feature: string, index: number) => (
                      <li key={index} className="text-sm text-gray-400 flex items-center">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    {isEditing(session.session_id) ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveEdit(session.session_id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                          disabled={isUploadingImage}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isUploadingImage ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700"
                          disabled={isUploadingImage}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(session)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(session.session_id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}