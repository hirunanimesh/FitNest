"use client"
import { useState, useEffect } from "react"
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
  Award, 
  Briefcase, 
  User, 
  Camera, 
  FileText, 
  Upload, 
  Plus, 
  Trash2,
  ArrowLeft 
} from "lucide-react"
import { AppLogo } from "@/components/AppLogo"
import { supabase } from "@/lib/supabase"
import { CompleteOAuthProfileTrainer } from "@/lib/api"

interface DocumentEntry {
  id: string
  type: string
  file: File | null
  uploaded: boolean
  url?: string
}

export default function CompleteTrainerProfile() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [documents, setDocuments] = useState<DocumentEntry[]>([
    { id: '1', type: '', file: null, uploaded: false }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [prefilledData, setPrefilledData] = useState({
    fullName: "",
    email: "",
    profileImageUrl: ""
  })

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
      const fullName = session.user.user_metadata?.full_name || "";
      
      setPrefilledData({
        fullName: fullName,
        email: session.user.email || "",
        profileImageUrl: session.user.user_metadata?.picture || ""
      });
    };

    checkUserSession();
  }, [router]);

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
      const nameWithInitials = formData.get("nameWithInitials") as string
      const contactNo = formData.get("contactNo") as string
      const bio = formData.get("bio") as string
      const skills = formData.get("skills") as string
      const experience = parseInt(formData.get("experience") as string)

      // Validate documents
      const validDocuments = documents.filter(doc => doc.file && doc.type.trim())
      if (validDocuments.length === 0) {
        throw new Error("Please add at least one verification document")
      }

      // Upload profile image
      const profileImageUrl = await uploadProfileImage()

      // Upload documents
      const documentsData = await uploadDocuments()

      // Prepare trainer data for OAuth completion
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
      submitData.append("nameWithInitials", nameWithInitials)
      submitData.append("email", prefilledData.email)
      submitData.append("contactNo", contactNo)
      submitData.append("bio", bio)
      submitData.append("skills", skills)
      submitData.append("experience", experience.toString())
      submitData.append("profileImage", profileImageUrl || "")
      submitData.append("documents", JSON.stringify(documentsData))
      submitData.append("userRole", "trainer")

      // Debug FormData
      console.log("=== FormData Debug ===");
      for (let [key, value] of submitData.entries()) {
        console.log(key + ':', value);
      }

      // Submit to your backend
      console.log('Submitting OAuth trainer data') // Debug log
      
      const response = await CompleteOAuthProfileTrainer(submitData)
      console.log('Success response:', response) // Debug log

      // Check if trainer already exists
      if (response && response.alreadyExists) {
        setError("Your trainer profile already exists! You are already registered. Please login instead.");
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
      console.error("Error completing trainer profile:", err)
      // Check if the error response contains the already exists message
      if (err.response?.data?.alreadyExists) {
        setError("Your trainer profile already exists! You are already registered. Please login instead.");
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
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <AppLogo />
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                <Award className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Complete Trainer Profile
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Finish setting up your trainer profile with FitConnect
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Display OAuth info */}
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                <p className="text-sm text-red-200">
                  <strong>Connected with Google:</strong> {prefilledData.email}
                </p>
                {prefilledData.profileImageUrl && (
                  <div className="mt-3">
                    <img 
                      src={prefilledData.profileImageUrl} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full border-2 border-red-500/30"
                    />
                  </div>
                )}
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nameWithInitials" className="text-gray-300">
                      Name with Initials *
                    </Label>
                    <Input 
                      id="nameWithInitials"
                      name="nameWithInitials"
                      placeholder="e.g., John A. Smith" 
                      defaultValue={prefilledData.fullName}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                      required 
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email Address (From Google)
                    </Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      value={prefilledData.email}
                      className="bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNo" className="text-gray-300">
                      Contact Number *
                    </Label>
                    <Input 
                      id="contactNo"
                      name="contactNo"
                      type="tel" 
                      placeholder="Enter your phone number" 
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                      required 
                      disabled={loading}
                    />
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Professional Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Professional Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-300">Professional Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about your experience, specializations, and training philosophy..."
                      className="min-h-[120px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-400">
                      This will be displayed on your trainer profile to help clients understand your expertise.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-gray-300">
                      Skills & Specializations *
                    </Label>
                    <Textarea
                      id="skills"
                      name="skills"
                      placeholder="e.g., Weight Loss, Strength Training, Yoga, CrossFit, Personal Training, Nutrition Coaching..."
                      className="min-h-[100px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-400">
                      List your training specializations, certifications, and areas of expertise
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-gray-300">
                      Years of Experience *
                    </Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="Enter years of experience"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Profile Image Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Profile Image</h3>
                  </div>

                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                    {prefilledData.profileImageUrl && !profileImage ? (
                      <div className="space-y-4">
                        <img 
                          src={prefilledData.profileImageUrl} 
                          alt="Current profile" 
                          className="w-24 h-24 rounded-full mx-auto border-4 border-red-500/30"
                        />
                        <p className="text-sm text-gray-300">Current profile image from Google</p>
                        <Label 
                          htmlFor="profileImage" 
                          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition-colors"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Change Profile Image
                        </Label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <Label 
                          htmlFor="profileImage" 
                          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition-colors"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Profile Image
                        </Label>
                      </div>
                    )}
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                    {profileImage && (
                      <p className="text-sm text-green-400 mt-2">
                        ✓ New image selected: {profileImage.name}
                      </p>
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
                    <h3 className="text-lg font-semibold text-white">Verification Documents *</h3>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-300">
                      Please upload your fitness certification, CPR certification, professional
                      license (if applicable), and any specialized training certificates.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <div key={doc.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 space-y-3">
                            <Select 
                              value={doc.type} 
                              onValueChange={(value) => updateDocumentType(doc.id, value)}
                              disabled={loading}
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="fitness-certification" className="text-white">Fitness Certification</SelectItem>
                                <SelectItem value="cpr-certification" className="text-white">CPR Certification</SelectItem>
                                <SelectItem value="professional-license" className="text-white">Professional License</SelectItem>
                                <SelectItem value="specialized-training" className="text-white">Specialized Training Certificate</SelectItem>
                                <SelectItem value="degree" className="text-white">Degree/Diploma</SelectItem>
                                <SelectItem value="other" className="text-white">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <div className="flex items-center gap-3">
                              <Label 
                                htmlFor={`document-${doc.id}`} 
                                className="flex-1 cursor-pointer"
                              >
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-3 text-center hover:border-red-500 transition-colors">
                                  {doc.file ? (
                                    <span className="text-green-400 text-sm">✓ {doc.file.name}</span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">Choose file...</span>
                                  )}
                                </div>
                              </Label>
                              <Input
                                id={`document-${doc.id}`}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => updateDocumentFile(doc.id, e.target.files?.[0] || null)}
                                disabled={loading}
                              />
                            </div>
                          </div>
                          
                          {documents.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeDocumentEntry(doc.id)}
                              className="bg-red-900/20 border-red-700 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                              disabled={loading}
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
                      className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                      disabled={loading}
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
                      required 
                      className="mt-0.5 border-gray-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      disabled={loading}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                      I agree to the
                      <a href="/terms" className="text-red-400 hover:text-red-300 underline mx-1">Terms of Service</a>
                      and
                      <a href="/privacy" className="text-red-400 hover:text-red-300 underline mx-1">Privacy Policy</a>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="verification" 
                      required 
                      className="mt-0.5 border-gray-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      disabled={loading}
                    />
                    <Label htmlFor="verification" className="text-sm text-gray-300 leading-relaxed">
                      I confirm that all information provided is accurate and that I have the necessary 
                      qualifications and certifications to work as a fitness trainer.
                    </Label>
                  </div>
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                    <p className="text-green-300 text-sm">
                      ✓ Profile completed successfully! Redirecting to dashboard...
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? "Completing Profile..." : "Complete Trainer Profile"}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-gray-400">
                    Already have an account?
                    <a href="/auth/login" className="text-red-400 hover:text-red-300 underline ml-1">Sign in</a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
