import React from 'react'
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, X } from 'lucide-react';
import { AddSession, uploadToCloudinary } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

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
    const { toast } = useToast()
    const { getUserProfileId } = useAuth()
    const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isCreatingSession, setIsCreatingSession] = useState(false);
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


    // Set trainer ID when component mounts
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
        
        // Validate required fields
        if (!sessionForm.title || !sessionForm.description || !sessionForm.price || 
            !sessionForm.time || !sessionForm.duration || !sessionForm.date) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please fill in all required fields"
            });
            return;
        }

        if (!sessionForm.img_url) {
            toast({
                variant: "destructive", 
                title: "Image Required",
                description: "Please upload an image for the session"
            });
            return;
        }

        setIsCreatingSession(true);
        
        try {
            // Get trainer ID from auth context
            const trainerId = await getUserProfileId();
            if (!trainerId) {
                toast({
                    variant: "destructive",
                    title: "Authentication Error", 
                    description: "Unable to get trainer ID. Please log in again."
                });
                return;
            }

            // Prepare session data for backend
            const sessionData = {
                trainer_id: trainerId,
                title: sessionForm.title,
                description: sessionForm.description,
                price: sessionForm.price,
                time: sessionForm.time,
                duration: sessionForm.duration,
                zoom_link: sessionForm.zoom_link,
                img_url: sessionForm.img_url,
                date: sessionForm.date,
                booked: false,
                
            };

            // Call backend API
            const response = await AddSession(sessionData);
            
            // Add to local state (optional, for immediate UI update)
            const newSession: Session = {
                session_id: response.session_id || Date.now(),
                ...sessionData,
                users: [],
            };
            setSessions((prev) => [...prev, newSession]);

            // Reset form
            setSessionForm({
                title: "",
                description: "",
                price: 0,
                time: "",
                duration: "",
                zoom_link: "",
                img_url: "",
                date: "",
                trainer_id: trainerId,
                booked: false,
                product_id_stripe: "",
                price_id_stripe: "",
            });
            
            // Reset image states
            setSelectedImage(null);
            setImagePreview("");
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

    // Upload image to Cloudinary
    const uploadImageToTrainerService = async (file: File): Promise<string> => {
        try {
            const imageUrl = await uploadToCloudinary(file);
            return imageUrl;
        } catch (error: any) {
            console.error('Image upload error:', error)
            throw new Error('Failed to upload image')
        }
    }

    // Handle image file selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            const maxSize = 10 * 1024 * 1024 // 10MB

            if (!validTypes.includes(file.type)) {
                toast({
                    variant: "destructive",
                    title: "Invalid File Type",
                    description: "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
                });
                return
            }

            if (file.size > maxSize) {
                toast({
                    variant: "destructive", 
                    title: "File Too Large",
                    description: "File size must be less than 10MB"
                });
                return
            }

            setSelectedImage(file)
            
            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Upload image and update form
    const handleImageUpload = async () => {
        if (!selectedImage) return

        setIsUploadingImage(true)
        try {
            const imageUrl = await uploadImageToTrainerService(selectedImage)
            setSessionForm(prev => ({ ...prev, img_url: imageUrl }))
            toast({
                title: "Success!",
                description: "Image uploaded successfully!"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Upload Failed", 
                description: "Failed to upload image. Please try again."
            });
        } finally {
            setIsUploadingImage(false)
        }
    }

    // Remove selected image
    const removeImage = () => {
        setSelectedImage(null)
        setImagePreview("")
        setSessionForm(prev => ({ ...prev, img_url: "" }))
    }

  return (
    <div>
       <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs px-1 sm:px-2 md:px-3 h-7 sm:h-8 md:h-9 w-full sm:w-auto">
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
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="title" className="text-left sm:text-right text-sm sm:text-base">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={sessionForm.title}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="col-span-1 sm:col-span-3 bg-gray-800 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="description" className="text-left sm:text-right text-sm sm:text-base">
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={sessionForm.description}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="col-span-1 sm:col-span-3 bg-gray-800 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="price" className="text-left sm:text-right text-sm sm:text-base">
                        Price
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={sessionForm.price}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="col-span-1 sm:col-span-3 bg-gray-800 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="time" className="text-left sm:text-right text-sm sm:text-base">
                        Time
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={sessionForm.time}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, time: e.target.value }))}
                        className="col-span-1 sm:col-span-3 bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark] text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="date" className="text-left sm:text-right text-sm sm:text-base">
                        Date <span className="text-red-500">*</span>
                      </Label>
                      <div className="col-span-1 sm:col-span-3 space-y-2">
                        <Input
                          id="date"
                          type="date"
                          value={sessionForm.date}
                          onChange={(e) => setSessionForm((prev) => ({ ...prev, date: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark] text-sm sm:text-base"
                          required
                        />
                        {date && (
                          <p className="text-xs sm:text-sm text-gray-400">
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
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="duration" className="text-left sm:text-right text-sm sm:text-base">
                        Duration
                      </Label>
                      <Select
                        value={sessionForm.duration}
                        onValueChange={(value) => setSessionForm((prev) => ({ ...prev, duration: value }))}
                      >
                        <SelectTrigger className="col-span-1 sm:col-span-3 bg-gray-800 text-sm sm:text-base">
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
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                      <Label htmlFor="zoom_link" className="text-left sm:text-right text-sm sm:text-base">
                        Zoom Link
                      </Label>
                      <Input
                        id="zoom_link"
                        type="url"
                        value={sessionForm.zoom_link}
                        onChange={(e) => setSessionForm((prev) => ({ ...prev, zoom_link: e.target.value }))}
                        className="col-span-1 sm:col-span-3 bg-gray-800 text-sm sm:text-base"
                        placeholder="https://zoom.us/j/..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
                      <Label className="text-left sm:text-right text-sm sm:text-base">
                        Session Image
                      </Label>
                      <div className="col-span-1 sm:col-span-3 space-y-3">
                        {/* File Input */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="bg-gray-800 text-sm sm:text-base w-full sm:w-auto"
                          />
                          {selectedImage && !sessionForm.img_url && (
                            <Button
                              type="button"
                              onClick={handleImageUpload}
                              disabled={isUploadingImage}
                              variant="outline"
                              size="sm"
                              className='bg-green-700 text-xs sm:text-sm'
                            >
                              {isUploadingImage ? (
                                "Uploading..."
                              ) : (
                                <>
                                  <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">Upload</span>
                                  <span className="sm:hidden">Upload</span>
                                </>
                              )}
                            </Button>
                          )}
                          {sessionForm.img_url && (
                            <Button
                              type="button"
                              onClick={removeImage}
                              variant="outline"
                              size="sm"
                              className="text-xs sm:text-sm"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md border"
                            />
                          </div>
                        )}

                        {/* Success Message */}
                        {sessionForm.img_url && (
                          <p className="text-green-500 text-xs sm:text-sm">
                            ✓ Image uploaded successfully
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button
                      type="submit"
                      disabled={isCreatingSession || isUploadingImage}
                      className="w-full sm:w-auto text-sm sm:text-base"
                    >
                      {isCreatingSession ? "Creating..." : "Create Session"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
    </div>
  )
}

export default CreateSession

