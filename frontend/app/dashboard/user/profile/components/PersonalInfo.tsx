"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, MapPinIcon, Camera, Edit3, X } from "lucide-react"
import GoogleMapPicker from "@/components/GoogleMapPicker"
import { UpdateUserDetails } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
interface PersonalInfoProps {
  userData: any
  setUserData: (data: any) => void
  isEditing: boolean
}

export function PersonalInfo({ userData, setUserData, isEditing }: PersonalInfoProps) {
  const { getUserProfileId } = useAuth()
  const { toast } = useToast()
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(
    userData.location ? {
      lat: userData.location.lat || 0,
      lng: userData.location.lng || 0,
      address: userData.address || ""
    } : null
  )

  // Mock Cloudinary upload function - replace with actual implementation
  const uploadToCloudinary = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Generate a mock URL for development
        const mockUrl = `https://res.cloudinary.com/your-cloud/image/upload/v1/${Date.now()}_${file.name}`
        resolve(mockUrl)
        // In real implementation, reject with actual error
        // reject(new Error('Upload failed'))
      }, 2000)
    })
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
      const customerId = await getUserProfileId()
      if (!customerId) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Unable to get user ID. Please try logging in again."
        })
        return
      }

      // Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(selectedImage)
      
      // Update user profile with new image URL
      const formData = new FormData()
      formData.append('profileImage', selectedImage)
      
      await UpdateUserDetails(customerId, formData)
      
      // Update local state
      setUserData({ ...userData, avatar: imageUrl })
      
      // Reset modal state
      setSelectedImage(null)
      setImagePreview("")
      setIsImageModalOpen(false)
      
      toast({
        title: "Success!",
        description: "Profile image updated successfully"
      })
      
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to update profile image. Please try again."
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle location selection from GoogleMapPicker
  const handleLocationSelect = (selectedLocation: {lat: number, lng: number, address: string}) => {
    setLocation(selectedLocation)
    setUserData({ 
      ...userData, 
      address: selectedLocation.address,
      location: { lat: selectedLocation.lat, lng: selectedLocation.lng }
    })
    setIsMapOpen(false)
  }
  return (
    <>
    <Card className="bg-[#192024] text-white">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details and contact information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userData.avatar || "/placeholder.svg"} alt="Profile" />
              <AvatarFallback className="text-lg">
                {userData.firstName?.[0] || ""}{userData.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors"
                title="Change profile photo"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
          </div>
          {isEditing && (
            <div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsImageModalOpen(true)}
                className="bg-gray-700 text-white hover:bg-red-600 hover:text-white border-gray-700"
              >
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-1">JPG, PNG, GIF or WebP. Max size 10MB.</p>
            </div>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={userData.firstName}
              onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
              disabled={!isEditing}
              className="bg-[#192024] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={userData.lastName}
              onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
              disabled={!isEditing}
              className="bg-[#192024] text-white"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Location</Label>
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMapOpen(true)}
                  className="w-full justify-start bg-[#192024] border-gray-600 text-gray-200 hover:bg-[#2a2f35] hover:text-white"
                >
                  <MapPinIcon className="mr-2 h-4 w-4" />
                  {location ? "Change Location" : "Select Location"}
                </Button>
                {location?.address && (
                  <p className="text-sm text-gray-400 mt-2">
                    📍 {location.address}
                  </p>
                )}
              </>
            ) : (
              <Input
                value={userData.address || ""}
                disabled={true}
                className="bg-[#192024] text-white"
                placeholder="No location selected"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={userData.phone}
              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              disabled={!isEditing}
              className="bg-[#192024] text-white"
            />
          </div>
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-2 gap-4">
          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date Of Birth *</Label>
            {isEditing ? (
              <>
                <Input
                  type="date"
                  id="dateOfBirth"
                  value={userData.dateOfBirth || ""}
                  onChange={(e) => setUserData({ ...userData, dateOfBirth: e.target.value })}
                  className="bg-[#192024] text-white border-gray-600 focus:border-red-500 focus:ring-red-500/20 [color-scheme:dark]"
                  required
                />
                {userData.dateOfBirth && (
                  <p className="text-sm text-gray-400">
                    Selected: {new Date(userData.dateOfBirth).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </>
            ) : (
              <Input
                id="dateOfBirth"
                value={userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : ""}
                disabled={true}
                className="bg-[#192024] text-white"
              />
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            {isEditing ? (
              <Select
                value={userData.gender}
                onValueChange={(value) => setUserData({ ...userData, gender: value })}
              >
                <SelectTrigger className="bg-[#192024] text-white border-gray-600 hover:bg-[#2a2f35]">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="gender"
                value={userData.gender}
                disabled={true}
                className="bg-[#192024] text-white"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Map Modal */}
    {isMapOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#192024] border border-gray-600 p-6 rounded-xl max-w-4xl w-full mx-4 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Select Your Location</h3>
            <Button 
              variant="outline" 
              onClick={() => setIsMapOpen(false)}
              className="bg-[#192024] border-gray-600 text-gray-200 hover:bg-[#2a2f35] hover:text-white"
            >
              Close
            </Button>
          </div>
          <GoogleMapPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={location || undefined}
            searchPlaceholder="Search for your location..."
            height="400px"
          />
        </div>
      </div>
    )}
    </>
  )
}
