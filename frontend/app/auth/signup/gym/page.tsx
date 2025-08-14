"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, Plus, X, ArrowLeft, User, Mail, Lock, Phone, Camera, Building2, MapPin, Clock, FileImage } from "lucide-react"
import GoogleMapPicker from "@/components/GoogleMapPicker"
import { useRouter } from "next/navigation"

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
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [documents, setDocuments] = useState<DocumentEntry[]>([
    { id: '1', type: '', file: null, uploaded: false }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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

  // Upload file to Cloudinary (simulated)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `https://example.com/uploads/${file.name}`
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
    setError(null)
    setSuccess(false)

    try {
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

      // Prepare form data
      const form = e.currentTarget
      const formData = new FormData(form)
      
      const gymOwnerData = {
        gymName: formData.get("gymName") as string,
        ownerName: formData.get("ownerName") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
        operatingHours: formData.get("operatingHours") as string,
        address: location.address,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        contactNo: formData.get("contactNo") as string,
        description: formData.get("description") as string,
        profileImage: profileImageUrl,
        documents: documentsData,
        role: "gym_owner"
      }

      // Submit to backend (simulated)
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSuccess(true)
      form.reset()
      setProfileImage(null)
      setDocuments([{ id: '1', type: '', file: null, uploaded: false }])
      setLocation(null)

      // Redirect after success
      setTimeout(() => {
        console.log("Redirecting to login...")
      }, 2000)

    } catch (err: any) {
      setError(err.message || "Submission failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-red-950 py-1">
      <div className="container mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Register Your Gym
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Join FitConnect and connect with fitness enthusiasts
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Business Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Business Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gymName" className="text-gray-300">
                      Gym Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="gymName"
                      name="gymName"
                      placeholder="Enter your gym name" 
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-gray-300">
                      Owner's Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        id="ownerName"
                        name="ownerName"
                        placeholder="Enter owner's full name" 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pl-10"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Business Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        id="email"
                        name="email"
                        type="email" 
                        placeholder="Enter business email" 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pl-10"
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-300">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input 
                          id="password"
                          name="password"
                          type="password" 
                          placeholder="Create a strong password" 
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pl-10"
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="operatingHours" className="text-gray-300">
                        Operating Hours
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input 
                          id="operatingHours"
                          name="operatingHours"
                          placeholder="e.g., 6:00 AM - 10:00 PM" 
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNo" className="text-gray-300">
                        Contact Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input 
                          id="contactNo"
                          name="contactNo"
                          type="tel" 
                          placeholder="Enter contact number" 
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Location Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Location Details</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Gym Address
                    </Label>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                      {location ? location.address : "Please select location on map (optional)"}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="button"
                      onClick={openMapSelector}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {location ? "Change Location" : "Select Location on Map"}
                    </Button>

                    {location && (
                      <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                        <p className="text-green-300 text-sm">
                          ✓ Location selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Description Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Gym Description</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your gym facilities, equipment, services, and what makes it special..."
                      className="min-h-[120px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-400">
                      This will be displayed on your gym profile to attract potential members.
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Profile Image Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Gym Profile Image (Optional)</h3>
                  </div>

                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                    <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="mb-2">
                      <Label htmlFor="profileImage" className="cursor-pointer">
                        <span className="text-red-500 hover:text-red-400 font-medium">Upload gym photo</span>
                        <span className="text-gray-400"> or drag and drop</span>
                      </Label>
                      <Input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    {profileImage && (
                      <div className="mt-3 p-2 bg-green-900/20 border border-green-800 rounded-lg">
                        <p className="text-sm text-green-400">✓ Selected: {profileImage.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Verification Documents Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Verification Documents</h3>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-300">
                      <strong>Documents:</strong> Business registration certificate, business license, 
                      owner ID copy, property lease/ownership documents, and any relevant permits. (Optional - can be uploaded later)
                    </p>
                  </div>

                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <div key={doc.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="space-y-2">
                              <Label className="text-gray-300">
                                Document Type
                              </Label>
                              <Input
                                placeholder="e.g., Business License, Registration Certificate"
                                value={doc.type}
                                onChange={(e) => updateDocumentType(doc.id, e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-gray-300">
                                Document File
                              </Label>
                              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center bg-gray-800/30">
                                <FileText className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                                <Label htmlFor={`doc-${doc.id}`} className="cursor-pointer">
                                  <span className="text-red-400 hover:text-red-300">Choose file</span>
                                  <span className="text-gray-400"> (PDF, JPG, PNG)</span>
                                </Label>
                                <Input
                                  id={`doc-${doc.id}`}
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={(e) => updateDocumentFile(doc.id, e.target.files?.[0] || null)}
                                />
                                {doc.file && (
                                  <p className="text-sm text-green-400 mt-2">✓ {doc.file.name}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {documents.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocumentEntry(doc.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-6"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addDocumentEntry}
                      className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Another Document
                    </Button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      className="mt-0.5 border-gray-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                      I agree to the Terms and Conditions and Privacy Policy
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="verification" 
                      className="mt-0.5 border-gray-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <Label htmlFor="verification" className="text-sm text-gray-300 leading-relaxed">
                      I understand that my gym registration will be reviewed and verified before activation
                    </Label>
                  </div>
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                    <p className="text-red-300 text-center">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                    <p className="text-green-300 text-center">Application submitted successfully! Redirecting to login...</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? "Submitting Application..." : "Submit Application"}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-gray-400">
                    Already have an account?{" "}
                    <span className="text-red-400 hover:text-red-300 underline font-medium cursor-pointer">
                      Sign in
                    </span>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Map Modal */}
        {showMap && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Select Gym Location</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMap(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <GoogleMapPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={location || undefined}
                  searchPlaceholder="Search for your gym's address..."
                  height="500px"
                  className="text-white"
                />
              </div>
              
              <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowMap(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowMap(false)}
                  disabled={!location}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Location
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}