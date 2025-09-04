"use client";
import { useState,useCallback,useRef } from "react";
import { Card, CardContent, CardHeader} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Save, X } from "lucide-react";
import { useTrainerData } from '../context/TrainerContext';
import CreatePlan from './CreateSession';
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"
import axios from "axios";
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
  const { toast } = useToast()
  const { trainerData, refreshTrainerData } = useTrainerData();
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Session>>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sessions: Session[] = trainerData?.sessions || [];

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
  };
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/session/uploadsessionimage`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      )
      
      return response.data.imageUrl || response.data.url || response.data.secure_url
      
    } catch (error: any) {
      console.error('Image upload error:', error)
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      throw new Error('Image upload failed')
    }
  }

  // Handle image file selection
  const handleImageSelect = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
      })
      return
    }

    if (file.size > maxSize) {
      toast({
        variant: "destructive", 
        title: "File Too Large",
        description: "Please select an image smaller than 10MB"
      })
      return
    }

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [toast])

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleImageSelect(files[0])
    }
  }, [handleImageSelect])

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleImageSelect(files[0])
    }
  }

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage) return

    setIsUploadingImage(true)
    try {
      const sessionId = await getSessionId()
      if (!sessionId) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Unable to get user ID. Please try logging in again."
        })
        return
      }

      const imageUrl = await uploadToCloudinary(selectedImage)
      
      await UpdateSessionDetails(sessionId, { avatar: imageUrl })
      
      setSessionData({ ...sessionData, avatar: imageUrl })
      setSelectedImage(null)
      setImagePreview("")
      setIsImageModalOpen(false)
      
      toast({
        title: "Success!",
        description: "Profile image updated successfully"
      })
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to update profile image. Please try again."
      })
    } finally {
      setIsUploadingImage(false)
    }
  }
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (sessionId: number) => {
    try {
      // TODO: Implement save API call
      console.log('Saving session:', sessionId, editFormData);
      
      // Add your update API call here
      // await axios.put(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/session/${sessionId}`, editFormData);
      
      // Reset editing state
      setEditingSessionId(null);
      setEditFormData({});
      
      // Refresh data
      await refreshTrainerData();
    } catch (error) {
      console.error('Error updating session:', error);
      // Add error toast notification here
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = async (sessionId: number) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this session?');
      if (!confirmDelete) return;

      // Add your delete API call here
      // await axios.delete(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/session/${sessionId}`);
      
      console.log('Delete session:', sessionId);
      
      // Refresh the data after deletion
      await refreshTrainerData();
    } catch (error) {
      console.error('Error deleting session:', error);
      // You can add error toast notification here
    }
  };

  const isEditing = (sessionId: number) => editingSessionId === sessionId;

  return (
    <section id="sessions">
      <div className="container mx-auto px-4">
        <div className='flex flex-row justify-between'>
          <h2 className="text-2xl font-semibold mb-4 text-white">Ongoing Sessions</h2>
          <CreatePlan />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sessions.map((session: Session) => (
            <Card
              key={session.session_id}
              className="bg-gray-800 border-gray-700 transition-all duration-200 hover:shadow-lg hover:border-red-500"
            >
              <CardHeader>
                <img
                  src={session.img_url || "/placeholder.svg"}
                  alt={session.title}
                  className="w-full h-full object-cover rounded-md mb-2"
                />
                
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
                    <Input
                      value={editFormData.duration || ''}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="bg-[#192024] text-white border-gray-600 flex-1"
                    />
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
                      className="bg-[#192024] text-white border-gray-600 flex-1"
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
                      className="bg-[#192024] text-white border-gray-600 flex-1"
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
                      type="link"
                      value={editFormData.zoom_link || ''}
                      onChange={(e) => handleInputChange('link', e.target.value)}
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
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700"
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
                        onClick={() => handleDelete(session.session_id)}
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
          ))}
        </div>
      </div>
    </section>
  );
}