"use client"
import { useState, useEffect } from "react"
import {useToast} from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { 
  Building2, 
  MapPin, 
  Clock, 
  User, 
  Camera, 
  FileText, 
  Upload, 
  Plus, 
  Trash2,
  ArrowLeft,
  Phone,
  Mail,
  X
} from "lucide-react"
import { AppLogo } from "@/components/AppLogo"
import { supabase } from "@/lib/supabase"
import { CompleteOAuthProfileGym } from "@/lib/api"
import GoogleMapPicker from "@/components/GoogleMapPicker"

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

export default function CompleteGymProfile() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [documents, setDocuments] = useState<DocumentEntry[]>([
    { id: '1', type: '', file: null, uploaded: false }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [location, setLocation] = useState<Location | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [prefilledData, setPrefilledData] = useState({
    email: "",
    profileImageUrl: ""
  })
  
  const { toast } = useToast()
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No session, redirect to login
        router.push("/auth/login");
        return;
      }
       

      if (!session.user || !session.user.id) {
        console.error("Invalid session - missing user or user ID:", session);
        router.push("/auth/login");
        return;
      }

      console.log("Session user:", session.user);
      console.log("Session user ID:", session.user.id);

      setUser(session.user);
      
      // Pre-fill data from Google OAuth
      setPrefilledData({
        email: session.user.email || "",
        profileImageUrl: session.user.user_metadata?.picture || ""
      });
    };

    checkUserSession();
  }, [router]);

  // Show map modal
  const openMapSelector = () => {
    setShowMap(true)
  }

  // Handle location selection from map
  const handleLocationSelect = (selectedLocation: Location) => {
    setLocation(selectedLocation)
    setShowMap(false) // Close the modal automatically when location is selected
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

  // Upload profile image to Cloudinary
  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImage) return prefilledData.profileImageUrl || null
    return await uploadToCloudinary(profileImage)
  }

  // Upload all documents to Cloudinary
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

    if (!user) {
      setError("No user session found");
      setLoading(false);
      return;
    }

    try {
      // Get form data immediately while e.currentTarget is still valid
      const form = e.currentTarget as HTMLFormElement
      const formData = new FormData(form)
      
      // Extract form values immediately
      const gymName = formData.get("gymName") as string
      const ownerName = formData.get("ownerName") as string
      const contactNo = formData.get("contactNo") as string
      const description = formData.get("description") as string
      const operatingHours = formData.get("operatingHours") as string

      // Validate location selection
      if (!location) {
        throw new Error("Please select your gym location on the map")
      }

      // Validate documents
      const validDocuments = documents.filter(doc => doc.file && doc.type.trim())
      if (validDocuments.length === 0) {
        throw new Error("Please add at least one verification document")
      }

      //validate phone number (basic check)
      const phoneRegex = /^\d{10}$/; // exactly 10 digits
      if (!phoneRegex.test(contactNo)) {
        toast({
          variant: "destructive",
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit phone number.",
        });
        setLoading(false);
        return;
      }

      // Upload profile image
      const profileImageUrl = await uploadProfileImage()

      // Upload documents
      const documentsData = await uploadDocuments()

      // Prepare location object
      const locationObj = {
        lat: location.lat,
        lng: location.lng
      }

      // Prepare gym data for OAuth completion
      const submitData = new FormData()
      
      // Debug user information
      console.log("=== Frontend Debug Info ===");
      console.log("Full user object:", user);
      console.log("user.id:", user.id);
      console.log("user.id type:", typeof user.id);
      console.log("user.id length:", user.id ? user.id.length : 'N/A');
      
      if (!user.id) {
        throw new Error("User ID is missing from session");
      }
      
      submitData.append("user_id", user.id)
      submitData.append("gymName", gymName)
      submitData.append("ownerName", ownerName)
      submitData.append("email", prefilledData.email)
      submitData.append("contactNo", contactNo)
      submitData.append("address", location.address)
      submitData.append("description", description)
      submitData.append("location", JSON.stringify(locationObj))
      submitData.append("operatingHours", operatingHours)
      submitData.append("profileImage", profileImageUrl || "")
      submitData.append("documents", JSON.stringify(documentsData))
      submitData.append("userRole", "gym")

      // Debug FormData
      console.log("=== FormData Debug ===");
      for (let [key, value] of submitData.entries()) {
        console.log(key + ':', value);
      }

      // Submit to your backend
      console.log('Submitting OAuth gym data') // Debug log
      
      const response = await CompleteOAuthProfileGym(submitData)
      console.log('Success response:', response) // Debug log

      // Check if gym already exists
      if (response && response.alreadyExists) {
        setError("Your gym profile already exists! You are already registered. Please login instead.");
        setLoading(false);
        return;
      }

      setSuccess(true)
      form.reset()
      setProfileImage(null)
      setDocuments([{ id: '1', type: '', file: null, uploaded: false }])

      // Redirect after success
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)

    } catch (err: any) {
      console.error("Error completing gym profile:", err)
      // Check if the error response contains the already exists message
      if (err.response?.data?.alreadyExists) {
        setError("Your gym profile already exists! You are already registered. Please login instead.");
        
      } else {
        setError(err.message || "Profile completion failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AppLogo />
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-red-950 py-8">
      <div className="container mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <AppLogo />
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-black/50 border-gray-800 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border border-red-500/30">
                <Building2 className="h-10 w-10 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-white via-red-100 to-red-200 bg-clip-text text-transparent">
                  Complete Your Gym Profile
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg mt-2">
                  Help members find your gym by completing your profile
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-center">Profile completed successfully! Redirecting...</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-red-400" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gymName" className="text-gray-200">Gym Name *</Label>
                      <Input
                        id="gymName"
                        name="gymName"
                        required
                        placeholder="Enter your gym name"
                        className="bg-black/40 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ownerName" className="text-gray-200">Owner Name *</Label>
                      <Input
                        id="ownerName"
                        name="ownerName"
                        required
                        placeholder="Enter owner's name"
                        className="bg-black/40 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-200">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={prefilledData.email}
                      disabled
                      className="bg-gray-800/50 border-gray-600 text-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactNo" className="text-gray-200">Contact Number *</Label>
                    <Input
                      id="contactNo"
                      name="contactNo"
                      type="tel"
                      required
                      placeholder="Enter contact number"
                      className="bg-black/40 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-200">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your gym, facilities, and what makes it special..."
                      className="bg-black/40 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 min-h-[120px]"
                    />
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-400" />
                    Gym Location *
                  </h3>
                  
                  <div className="space-y-4">
                    {location ? (
                      <div className="p-4 bg-black/30 rounded-lg border border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-red-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-white">Selected Location</p>
                              <p className="text-sm text-gray-300 mt-1">{location.address}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openMapSelector}
                            className="border-gray-600 text-black hover:bg-gray-300 hover:text-gray-600"
                          >
                            Change Location
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 border-2 border-dashed border-gray-600 rounded-lg text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-300 mb-3">Select your gym's location</p>
                        <Button
                          type="button"
                          onClick={openMapSelector}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Choose Location on Map
                        </Button>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-400">
                      Click to select your gym's location on the map. This helps members find you easily.
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Operating Hours */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-400" />
                    Operating Hours
                  </h3>
                  
                  <div>
                    <Label htmlFor="operatingHours" className="text-gray-200">Operating Hours</Label>
                    <Textarea
                      id="operatingHours"
                      name="operatingHours"
                      placeholder="e.g., Monday - Friday: 5:00 AM - 11:00 PM&#10;Saturday - Sunday: 6:00 AM - 10:00 PM"
                      className="bg-black/40 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 min-h-[100px]"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Enter your gym's operating hours for all days of the week
                    </p>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Profile Image */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Camera className="h-5 w-5 text-red-400" />
                    Profile Image
                  </h3>
                  
                  <div className="space-y-3">
                    {prefilledData.profileImageUrl && !profileImage && (
                      <div className="flex items-center gap-4 p-4 bg-black/30 rounded-lg border border-gray-700">
                        <img 
                          src={prefilledData.profileImageUrl} 
                          alt="Current profile" 
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm text-gray-300">Using your Google profile image</p>
                          <p className="text-xs text-gray-500">Upload a new image to replace it</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                        className="bg-black/40 border-gray-700 text-white file:bg-red-600/20 file:text-red-300 file:border-red-500/30"
                      />
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    {profileImage && (
                      <p className="text-sm text-green-400">✓ New image selected: {profileImage.name}</p>
                    )}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Documents */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-400" />
                    Verification Documents *
                  </h3>
                  
                  <p className="text-sm text-gray-400">
                    Upload business registration, license, or other verification documents
                  </p>
                  
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4 bg-black/30 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <Select
                              value={doc.type}
                              onValueChange={(value) => updateDocumentType(doc.id, value)}
                            >
                              <SelectTrigger className="bg-black/40 border-gray-600 text-white">
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                                <SelectItem value="business-registration">Business Registration</SelectItem>
                                <SelectItem value="business-license">Business License</SelectItem>
                                <SelectItem value="tax-certificate">Tax Certificate</SelectItem>
                                <SelectItem value="insurance-certificate">Insurance Certificate</SelectItem>
                                <SelectItem value="health-permit">Health Department Permit</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => updateDocumentFile(doc.id, e.target.files?.[0] || null)}
                              className="bg-black/40 border-gray-600 text-white file:bg-red-600/20 file:text-red-300 file:border-red-500/30"
                            />
                            
                            {doc.file && (
                              <p className="text-xs text-green-400">✓ File selected: {doc.file.name}</p>
                            )}
                          </div>
                          
                          {documents.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocumentEntry(doc.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addDocumentEntry}
                      className="w-full border-gray-600 text-black hover:bg-gray-800 hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Document
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Completing Profile...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Complete Gym Profile
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    By completing your profile, you agree to our terms of service and privacy policy.
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
