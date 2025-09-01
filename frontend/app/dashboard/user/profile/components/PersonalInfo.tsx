"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
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
  const [formattedDob, setFormattedDob] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(
    userData.location ? {
      lat: userData.location.lat || 0,
      lng: userData.location.lng || 0,
      address: userData.address || ""
    } : null
  )

  // Memoized update function to prevent re-creation on every render
  const updateUserData = useCallback((field: string, value: any) => {
    setUserData((prev: any) => ({ ...prev, [field]: value }))
  }, [setUserData])

  // Memoized initials calculation
  const userInitials = useMemo(() => {
    const firstName = userData.firstName || ""
    const lastName = userData.lastName || ""
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }, [userData.firstName, userData.lastName])

  // Fix hydration mismatch by formatting date on client side only
  useEffect(() => {
    if (userData.dateOfBirth && typeof window !== "undefined") {
      setFormattedDob(
        new Date(userData.dateOfBirth).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      )
    } else {
      setFormattedDob("")
    }
  }, [userData.dateOfBirth])

  // Real Cloudinary upload function - replace with your actual implementation
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'your_upload_preset') // Replace with your preset
    formData.append('folder', 'fitnest/customers')

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dacknfqtw/image/upload', // Replace with your cloud name
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary')
      }

      const data = await response.json()
      return data.secure_url // This will be in format like your example
    } catch (error) {
      console.error('Cloudinary upload error:', error)
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
      const customerId = await getUserProfileId()
      if (!customerId) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Unable to get user ID. Please try logging in again."
        })
        return
      }

      // Upload image to Cloudinary first
      const imageUrl = await uploadToCloudinary(selectedImage)
      console.log("Cloudinary URL received:", imageUrl)
      
      // Update user profile with new image URL using regular object (not FormData)
      const updateData = {
        avatar: imageUrl  // This will be mapped to profile_img in the API
      }
      
      // Debug logging
      console.log("Customer ID:", customerId)
      console.log("Update data being sent:", updateData)
      
      await UpdateUserDetails(customerId, updateData)
      
      // Update local state with the new Cloudinary URL
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
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response?.data
      })
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
          <div className="relative cursor-pointer" onClick={isEditing ? () => setIsImageModalOpen(true) : undefined}>
            <Avatar className="h-24 w-24">
              <AvatarImage src={userData.avatar || "/placeholder.svg"} alt="Profile" />
              <AvatarFallback className="text-lg">
                {userData.firstName?.[0] || ""}{userData.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <Edit3 className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
            )}
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={userData.firstName || ""}
              onChange={(e) => updateUserData('firstName', e.target.value)}
              disabled={!isEditing}
              className="bg-[#192024] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={userData.lastName || ""}
              onChange={(e) => updateUserData('lastName', e.target.value)}
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
              value={userData.phone || ""}
              onChange={(e) => updateUserData('phone', e.target.value)}
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
                  onChange={(e) => updateUserData('dateOfBirth', e.target.value)}
                  className="bg-[#192024] text-white border-gray-600 focus:border-red-500 focus:ring-red-500/20 [color-scheme:dark]"
                  required
                />
                {formattedDob && (
                  <p className="text-sm text-gray-400">
                    Selected: {formattedDob}
                  </p>
                )}
              </>
            ) : (
              <Input
                id="dateOfBirth"
                value={formattedDob}
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
                value={userData.gender || ""}
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
                value={userData.gender || ""}
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

    {/* Image Upload Modal */}
    {isImageModalOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[#192024] border border-gray-600 p-6 rounded-xl max-w-lg w-full mx-4 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Update Profile Photo</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setIsImageModalOpen(false)
                setSelectedImage(null)
                setImagePreview("")
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Profile Image */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={imagePreview || userData.avatar || "/placeholder.svg"} alt="Profile" />
                <AvatarFallback className="text-2xl">
                  {userData.firstName?.[0] || ""}{userData.lastName?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              {imagePreview && (
                <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Preview</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging 
                ? 'border-red-500 bg-red-500/10' 
                : 'border-gray-600 bg-gray-800/30 hover:bg-gray-800/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            
            <div className="mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-700 text-white hover:bg-red-600 border-gray-600"
              >
                Set New Profile Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
            
            <p className="text-gray-400 text-sm mb-2">
              or drag and drop your image here
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF, WebP up to 10MB
            </p>
            
            {selectedImage && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <p className="text-sm text-green-400">✓ Selected: {selectedImage.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsImageModalOpen(false)
                setSelectedImage(null)
                setImagePreview("")
              }}
              className="flex-1 bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
              disabled={isUploadingImage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImageUpload}
              disabled={!selectedImage || isUploadingImage}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isUploadingImage ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                "Update Photo"
              )}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
