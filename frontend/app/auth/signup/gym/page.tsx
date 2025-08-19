"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, Plus, X, ArrowLeft, User, Mail, Lock, Phone, Camera, Building2, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { AppLogo } from "@/components/AppLogo"
import GoogleMapPicker from "@/components/GoogleMapPicker"
import { useRouter } from "next/navigation"
import { GymRegister } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface DocumentEntry {
  id: string
  type: string
  file: File | null
  uploaded: boolean
  url?: string
}

interface Location {
  lat: number
  lng: number
  address: string
}

export default function GymOwnerSignup() {
  const router = useRouter()
  const { toast } = useToast()
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [documents, setDocuments] = useState<DocumentEntry[]>([
    { id: '1', type: '', file: null, uploaded: false }
  ])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [showMap, setShowMap] = useState(false)

  // Show map modal
  const openMapSelector = () => {
    setShowMap(true)
  }

  // Handle location selection from map
  const handleLocationSelect = (selectedLocation: Location) => {
    setLocation(selectedLocation)
  }

  // Add new document entry
  const addDocumentEntry = () => {
    const newId = Date.now().toString()
    setDocuments([...documents, { id: newId, type: '', file: null, uploaded: false }])
  }

  // Remove document entry
  const removeDocumentEntry = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id))
  }

  // Update document type
  const updateDocumentType = (id: string, type: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, type } : doc
    ))
  }

  // Update document file
  const updateDocumentFile = (id: string, file: File | null) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, file } : doc
    ))
  }

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Validate environment variables first
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    
    console.log('Cloudinary config:', { cloudName, uploadPreset }) // Debug log
    console.log('File to upload:', file.name, file.type, file.size) // Debug log
    
    if (!cloudName) {
      throw new Error('Cloudinary cloud name is not configured')
    }
    
    if (!uploadPreset || uploadPreset === 'your_upload_preset_name' || uploadPreset === 'YOUR_ACTUAL_PRESET_NAME') {
      throw new Error('Cloudinary upload preset is not configured properly. Please check your .env file and Cloudinary dashboard.')
    }
    
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('upload_preset', uploadPreset)
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
    console.log('Upload URL:', uploadUrl) // Debug log
    console.log('Using upload preset:', uploadPreset) // Debug log
    
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: uploadFormData
      })
      
      console.log('Response status:', response.status, response.statusText) // Debug log
      
      // Always try to get response text first
      const responseText = await response.text()
      console.log('Response text:', responseText) // Debug log
      
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch (e) {
        errorData = { message: responseText }
      }
      
      if (!response.ok) {
        console.error('Cloudinary error details:', errorData)
        const errorMessage = errorData?.error?.message || errorData?.message || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(`Upload failed: ${errorMessage}`)
      }
      
      return errorData.secure_url
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to upload file')
    }
  }

  // Upload profile image
  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImage) return null
    return await uploadToCloudinary(profileImage)
  }

  // Upload all documents
  const uploadDocuments = async (): Promise<Array<{type: string, url: string}>> => {
    const uploadPromises = documents
      .filter(doc => doc.file && doc.type.trim())
      .map(async (doc) => {
        const url = await uploadToCloudinary(doc.file!)
        return { type: doc.type.trim(), url }
      })
    
    return await Promise.all(uploadPromises)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get form data immediately while e.currentTarget is still valid
      const form = e.currentTarget as HTMLFormElement
      const formData = new FormData(form)
      
      // Extract form values immediately
      const gymName = formData.get("gymName") as string
      const ownerName = formData.get("ownerName") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const confirmPassword = formData.get("confirmPassword") as string
      const operatingHours = formData.get("operatingHours") as string
      const contactNo = formData.get("contactNo") as string
      const description = formData.get("description") as string

      // Password validation
      if (password !== confirmPassword) {
        throw new Error("Password and confirm password should be same")
      }

      // Validate documents
      const validDocuments = documents.filter(doc => doc.file && doc.type.trim())
      if (validDocuments.length === 0) {
        throw new Error("Please add at least one verification document")
      }

      if (!location) {
        throw new Error("Please select your gym location on the map")
      }

      // Upload profile image
      const profileImageUrl = await uploadProfileImage()

      // Upload documents
      const documentsData = await uploadDocuments()

      // Prepare gym data
      const gymData = {
        gymName,
        ownerName,
        email,
        password,
        confirmPassword,
        operatingHours,
        address: location.address,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        contactNo,
        description,
        profileImage: profileImageUrl,
        documents: documentsData, // Array of {type, url} objects
        role: "gym_owner"
      }

      // Submit to your backend
      console.log('Submitting gym data:', gymData) // Debug log
      
      const response = await GymRegister(gymData)
      console.log('Success response:', response) // Debug log

      toast({
        title: "Registration Successful!",
        description: "Your gym registration has been submitted successfully. Redirecting to login...",
      })
      
      form.reset()
      setProfileImage(null)
      setDocuments([{ id: '1', type: '', file: null, uploaded: false }])
      setLocation(null)

      // Redirect after success
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)

    } catch (err: any) {
      console.error('Error submitting gym data:', err)
      
      // Check if error message indicates user already exists
      const errorMessage = err.message || "Submission failed. Please try again."
      if (errorMessage.toLowerCase().includes("already exists") || 
          errorMessage.toLowerCase().includes("user exists") ||
          errorMessage.toLowerCase().includes("already registered") ||
          errorMessage.toLowerCase().includes("duplicate") ||
          err.code === 'user_already_exists') {
        toast({
          variant: "destructive",
          title: "User Already Exists",
          description: "An account with this email already exists. Please use a different email or try logging in.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/30 py-4">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 border border-slate-700/50 hover:border-slate-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FitConnect</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-red-950/50 p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-700/10"></div>
            <div className="relative">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent mb-4">
                Register Your Gym
              </h1>
              <p className="text-slate-400 text-lg font-medium">
                Join FitConnect and connect with fitness enthusiasts worldwide
              </p>
            </div>
          </div>
          
          {/* Form Content */}
          <div className="p-8">
            <div className="space-y-10">
              {/* Business Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Business Information</h2>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-200">
                      Gym Name <span className="text-red-400">*</span>
                    </label>
                    <input 
                      name="gymName"
                      placeholder="Enter your gym name" 
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 backdrop-blur-sm"
                      required 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-200">
                      Owner's Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                      <input 
                        name="ownerName"
                        placeholder="Enter owner's full name" 
                        className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 backdrop-blur-sm"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-200">
                      Business Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                      <input 
                        name="email"
                        type="email" 
                        placeholder="Enter business email" 
                        className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 backdrop-blur-sm"
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-200">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                        <input 
                          name="password"
                          type="password" 
                          placeholder="Create a strong password" 
                          className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 backdrop-blur-sm"
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-200">
                        Confirm Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                        <input
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-200">
                        Operating Hours <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                        <input 
                          name="operatingHours"
                          placeholder="e.g., 6:00 AM - 10:00 PM" 
                          className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-200">
                        Contact Number <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                        <input 
                          name="contactNo"
                          type="tel" 
                          placeholder="Enter contact number" 
                          className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 backdrop-blur-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700/50"></div>

              {/* Location Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Location Details</h2>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-200">
                    Gym Address <span className="text-red-400">*</span>
                  </label>
                  <div className="p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-200 backdrop-blur-sm min-h-[50px] flex items-center">
                    {location ? location.address : "Please select location on map"}
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={openMapSelector}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <MapPin className="h-5 w-5" />
                    {location ? "Change Location" : "Select Location on Map"}
                  </button>

                  {location && (
                    <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-emerald-700/50 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <p className="text-emerald-300 font-medium">
                          Location confirmed: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-700/50"></div>

              {/* Description Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Gym Description</h2>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-200">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe your gym facilities, equipment, services, and what makes it special..."
                    className="w-full px-4 py-3 min-h-[120px] bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 backdrop-blur-sm resize-none"
                    required
                  />
                  <p className="text-sm text-slate-400">
                    This will be displayed on your gym profile to attract potential members.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-700/50"></div>

              {/* Profile Image Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Gym Profile Image</h2>
                  <span className="px-3 py-1 text-xs font-medium text-slate-400 bg-slate-700/50 rounded-full">Optional</span>
                </div>

                <div className="border-2 border-dashed border-slate-600/50 rounded-2xl p-8 text-center bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer">
                  <div className="mx-auto w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="profileImage" className="cursor-pointer">
                      <span className="text-red-400 hover:text-red-300 font-semibold text-lg">Upload gym photo</span>
                      <span className="text-slate-400"> or drag and drop</span>
                    </label>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                    />
                  </div>
                  <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  {profileImage && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-emerald-700/50 rounded-xl">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <p className="text-sm text-emerald-300 font-medium">Selected: {profileImage.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-700/50"></div>

              {/* Verification Documents Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Verification Documents</h2>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-700/50 rounded-xl backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-1">Required Documents:</p>
                      <p className="text-sm text-blue-200">
                        Business registration certificate, business license, owner ID copy, property lease/ownership documents, 
                        and any relevant permits. At least one document is required.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={doc.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-200">
                              Document Type <span className="text-red-400">*</span>
                            </label>
                            <input
                              placeholder="e.g., Business License, Registration Certificate"
                              value={doc.type}
                              onChange={(e) => updateDocumentType(doc.id, e.target.value)}
                              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                              required
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-200">
                              Document File <span className="text-red-400">*</span>
                            </label>
                            <div className="border-2 border-dashed border-slate-600/50 rounded-xl p-4 text-center bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer">
                              <FileText className="mx-auto h-8 w-8 text-slate-500 mb-2" />
                              <label htmlFor={`doc-${doc.id}`} className="cursor-pointer">
                                <span className="text-red-400 hover:text-red-300 font-medium">Choose file</span>
                                <span className="text-slate-400"> (PDF, JPG, PNG)</span>
                              </label>
                              <input
                                id={`doc-${doc.id}`}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => updateDocumentFile(doc.id, e.target.files?.[0] || null)}
                                required
                              />
                              {doc.file && (
                                <div className="mt-2 flex items-center justify-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                  <p className="text-sm text-emerald-300 font-medium">{doc.file.name}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {documents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocumentEntry(doc.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-300 mt-8"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addDocumentEntry}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-800/50 border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50 text-slate-200 font-semibold rounded-xl transition-all duration-300"
                  >
                    <Plus className="h-5 w-5" />
                    Add Another Document
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <input 
                    id="terms" 
                    type="checkbox"
                    required 
                    className="mt-1 w-4 h-4 text-red-600 bg-slate-800 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-300 leading-relaxed">
                    I agree to the{" "}
                    <a href="/terms" className="text-red-400 hover:text-red-300 underline font-medium">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-red-400 hover:text-red-300 underline font-medium">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <div className="flex items-start space-x-4">
                  <input 
                    id="verification" 
                    type="checkbox"
                    required 
                    className="mt-1 w-4 h-4 text-red-600 bg-slate-800 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <label htmlFor="verification" className="text-sm text-slate-300 leading-relaxed">
                    I understand that my gym registration will be reviewed and verified before activation
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-bold py-4 text-lg shadow-2xl hover:shadow-red-500/20 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    Submitting Application...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-slate-400">
                  Already have an account?{" "}
                  <a href="/auth/login" className="text-red-400 hover:text-red-300 underline font-semibold transition-colors duration-300">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Modal */}
        {showMap && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Select Gym Location</h3>
                  <button
                    onClick={() => setShowMap(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="w-full h-[500px] bg-slate-800 rounded-xl border border-slate-700/50 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                    <p className="text-slate-400">Google Map integration would go here</p>
                    <p className="text-sm text-slate-500 mt-2">Click on the map to select your gym location</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-700/50 flex gap-3 justify-end">
                <button
                  onClick={() => setShowMap(false)}
                  className="px-6 py-3 border border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-white font-medium rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setLocation({ lat: 6.7957, lng: 79.9009, address: "Sample Address, Moratuwa, Sri Lanka" });
                    setShowMap(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg"
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}