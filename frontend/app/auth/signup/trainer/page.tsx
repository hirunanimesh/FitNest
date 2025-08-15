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
import { Upload, FileText, Plus, X, ArrowLeft, User, Mail, Lock, Phone, Camera, Award, Briefcase } from "lucide-react"
import Link from "next/link"
import { AppLogo } from "@/components/AppLogo"
import { useRouter } from "next/navigation"
import { TrainerRegister } from "@/lib/api"

interface DocumentEntry {
  id: string
  type: string
  file: File | null
  uploaded: boolean
  url?: string
}

export default function TrainerSignup() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [documents, setDocuments] = useState<DocumentEntry[]>([
    { id: '1', type: '', file: null, uploaded: false }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
    if (!profileImage) return null
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

    try {
      // Get form data immediately while e.currentTarget is still valid
      const form = e.currentTarget as HTMLFormElement
      const formData = new FormData(form)
      
      // Extract form values immediately
      const nameWithInitials = formData.get("nameWithInitials") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const confirmPassword = formData.get("confirmPassword") as string
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

      // Prepare trainer data
      const trainerData = {
        nameWithInitials,
        email,
        password,
        confirmPassword,
        contactNo,
        bio,
        skills,
        experience,
        profileImage: profileImageUrl,
        documents: documentsData, // Array of {type, url} objects
        role: "trainer"
      }

      // Submit to your backend
      console.log('Submitting trainer data:', trainerData) // Debug log
      
      const response = await TrainerRegister(trainerData)
      console.log('Success response:', response) // Debug log

      setSuccess(true)
      form.reset()
      setProfileImage(null)
      setDocuments([{ id: '1', type: '', file: null, uploaded: false }])

      // Redirect after success
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)

    } catch (err: any) {
      setError(err.message || "Submission failed. Please try again.")
    } finally {
      setLoading(false)
    }
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
                Become a Trainer
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Join FitConnect and start training clients today
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
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
                      Name with Initials <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="nameWithInitials"
                      name="nameWithInitials"
                      placeholder="e.g., John A. Smith" 
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        id="email"
                        name="email"
                        type="email" 
                        placeholder="Enter your email" 
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
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNo" className="text-gray-300">
                      Contact Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        id="contactNo"
                        name="contactNo"
                        type="tel" 
                        placeholder="Enter your phone number" 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pl-10"
                        required 
                      />
                    </div>
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
                    />
                    <p className="text-xs text-gray-400">
                      This will be displayed on your trainer profile to help clients understand your expertise.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-gray-300">
                      Skills & Specializations <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="skills"
                      name="skills"
                      placeholder="e.g., Weight Loss, Strength Training, Yoga, CrossFit, Personal Training, Nutrition Coaching..."
                      className="min-h-[100px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                    <p className="text-xs text-gray-400">
                      List your training specializations, certifications, and areas of expertise
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-gray-300">
                      Years of Experience <span className="text-red-500">*</span>
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
                    <h3 className="text-lg font-semibold text-white">Profile Image (Optional)</h3>
                  </div>

                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                    <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="mb-2">
                      <Label htmlFor="profileImage" className="cursor-pointer">
                        <span className="text-red-500 hover:text-red-400 font-medium">Upload a professional photo</span>
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
                      <strong>Required Documents:</strong> Fitness certification, CPR certification, professional
                      license (if applicable), and any specialized training certificates.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <div key={doc.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="space-y-2">
                              <Label className="text-gray-300">
                                Document Type <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                placeholder="e.g., Fitness Certification, CPR Certificate"
                                value={doc.type}
                                onChange={(e) => updateDocumentType(doc.id, e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500"
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-gray-300">
                                Document File <span className="text-red-500">*</span>
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
                                  required
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
                      required 
                      className="mt-0.5 border-gray-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-red-400 hover:text-red-300 underline">
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-red-400 hover:text-red-300 underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="verification" 
                      required 
                      className="mt-0.5 border-gray-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <Label htmlFor="verification" className="text-sm text-gray-300 leading-relaxed">
                      I understand that my account will be reviewed and verified before activation
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
                    <Link href="/auth/login" className="text-red-400 hover:text-red-300 underline font-medium">
                      Sign in
                    </Link>
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