"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, FileText } from "lucide-react"
import Link from "next/link"

export default function TrainerSignup() {
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [verificationDocs, setVerificationDocs] = useState<File[]>([])

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVerificationDocs(Array.from(e.target.files))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-black">Become a Trainer</CardTitle>
              <CardDescription className="text-gray-600">
                Join FitConnect and start training clients today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-2">
                  <Label htmlFor="nameWithInitials">Name with Initials *</Label>
                  <Input id="nameWithInitials" placeholder="e.g., John A. Smith" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="Enter your email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input id="password" type="password" placeholder="Create a strong password" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm your password" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNo">Contact Number *</Label>
                  <Input id="contactNo" type="tel" placeholder="Enter your phone number" required />
                </div>

                {/* Bio Section */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your experience, specializations, and training philosophy..."
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-gray-500">
                    This will be displayed on your trainer profile to help clients understand your expertise.
                  </p>
                </div>

                {/* Specializations */}
                <div className="space-y-2">
                  <Label htmlFor="specializations">Specializations *</Label>
                  <Input
                    id="specializations"
                    placeholder="e.g., Weight Loss, Strength Training, Yoga, Nutrition"
                    required
                  />
                  <p className="text-xs text-gray-500">Separate multiple specializations with commas</p>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Enter years of experience"
                    required
                  />
                </div>

                {/* Profile Image */}
                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Image (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="profileImage" className="cursor-pointer">
                        <span className="text-red-600 hover:text-red-500">Upload a professional photo</span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </Label>
                      <Input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                    {profileImage && <p className="text-sm text-green-600 mt-2">Selected: {profileImage.name}</p>}
                  </div>
                </div>

                {/* Verification Documents */}
                <div className="space-y-2">
                  <Label htmlFor="verificationDocs">Verification Documents *</Label>
                  <div className="border-2 border-dashed border-red-200 rounded-lg p-6 text-center bg-red-50">
                    <FileText className="mx-auto h-12 w-12 text-red-400" />
                    <div className="mt-4">
                      <Label htmlFor="verificationDocs" className="cursor-pointer">
                        <span className="text-red-600 hover:text-red-500">Upload certification documents</span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </Label>
                      <Input
                        id="verificationDocs"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
                        onChange={handleDocumentUpload}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload certifications, licenses, or qualifications (PDF, JPG, PNG)
                    </p>
                    {verificationDocs.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-green-600 font-medium">
                          {verificationDocs.length} document(s) selected:
                        </p>
                        <ul className="text-xs text-gray-600 mt-1">
                          {verificationDocs.map((doc, index) => (
                            <li key={index}>{doc.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Required Documents:</strong> Fitness certification, CPR certification, professional
                      license (if applicable), and any specialized training certificates.
                    </p>
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="10"
                    max="500"
                    placeholder="Enter your hourly rate"
                    required
                  />
                  <p className="text-xs text-gray-500">You can adjust this later in your trainer dashboard</p>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <Label>Preferred Training Times</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-normal">Morning (6AM - 12PM)</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="morning" />
                        <Label htmlFor="morning" className="text-sm">
                          Available
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-normal">Afternoon (12PM - 6PM)</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="afternoon" />
                        <Label htmlFor="afternoon" className="text-sm">
                          Available
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-normal">Evening (6PM - 10PM)</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="evening" />
                        <Label htmlFor="evening" className="text-sm">
                          Available
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-normal">Weekends</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="weekends" />
                        <Label htmlFor="weekends" className="text-sm">
                          Available
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-red-600 hover:text-red-500 underline">
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-red-600 hover:text-red-500 underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="verification" required />
                    <Label htmlFor="verification" className="text-sm">
                      I understand that my account will be reviewed and verified before activation
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Submit Application
                </Button>

                <div className="text-center">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-red-600 hover:text-red-500 underline">
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
