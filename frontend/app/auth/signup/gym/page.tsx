"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, MapPin } from "lucide-react"
import Link from "next/link"
import { AppLogo } from "@/components/AppLogo";
export default function GymSignup() {
  const [gymImages, setGymImages] = useState<File[]>([])
  const [verificationDocs, setVerificationDocs] = useState<File[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGymImages(Array.from(e.target.files))
    }
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVerificationDocs(Array.from(e.target.files))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <AppLogo />
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-black">Register Your Gym</CardTitle>
              <CardDescription className="text-gray-600">
                Partner with FitConnect and grow your gym business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-6">
                {/* Gym Information */}
                <div className="space-y-2">
                  <Label htmlFor="gymName">Gym Name *</Label>
                  <Input id="gymName" placeholder="Enter your gym's name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input id="ownerName" placeholder="Enter the owner's full name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Business Email Address *</Label>
                  <Input id="email" type="email" placeholder="Enter business email" required />
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
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input id="phoneNumber" type="tel" placeholder="Enter business phone number" required />
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <Label className="text-lg font-semibold">Location Details</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter complete gym address including street, city, state, zip code"
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" placeholder="Enter city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Input id="state" placeholder="Enter state/province" required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                      <Input id="zipCode" placeholder="Enter ZIP code" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Gym Details */}
                <div className="space-y-2">
                  <Label htmlFor="gymType">Gym Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gym type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial Gym</SelectItem>
                      <SelectItem value="boutique">Boutique Fitness</SelectItem>
                      <SelectItem value="crossfit">CrossFit Box</SelectItem>
                      <SelectItem value="yoga">Yoga Studio</SelectItem>
                      <SelectItem value="martial-arts">Martial Arts</SelectItem>
                      <SelectItem value="swimming">Swimming Pool</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Gym Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your gym, facilities, equipment, and what makes it special..."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                {/* Facilities & Amenities */}
                <div className="space-y-2">
                  <Label>Available Facilities & Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      "Free Weights",
                      "Cardio Equipment",
                      "Group Classes",
                      "Personal Training",
                      "Locker Rooms",
                      "Showers",
                      "Parking",
                      "WiFi",
                      "Air Conditioning",
                      "Sauna",
                      "Swimming Pool",
                      "Juice Bar",
                    ].map((facility) => (
                      <div key={facility} className="flex items-center space-x-2">
                        <Checkbox id={facility.toLowerCase().replace(" ", "-")} />
                        <Label htmlFor={facility.toLowerCase().replace(" ", "-")} className="text-sm">
                          {facility}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="space-y-2">
                  <Label>Operating Hours</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekdayHours" className="text-sm">
                        Weekdays (Mon-Fri)
                      </Label>
                      <Input id="weekdayHours" placeholder="e.g., 5:00 AM - 11:00 PM" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weekendHours" className="text-sm">
                        Weekends (Sat-Sun)
                      </Label>
                      <Input id="weekendHours" placeholder="e.g., 6:00 AM - 10:00 PM" />
                    </div>
                  </div>
                </div>

                {/* Gym Images */}
                <div className="space-y-2">
                  <Label htmlFor="gymImages">Gym Photos *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="gymImages" className="cursor-pointer">
                        <span className="text-red-600 hover:text-red-500">Upload gym photos</span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </Label>
                      <Input
                        id="gymImages"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload multiple photos showing your gym facilities (PNG, JPG, GIF up to 10MB each)
                    </p>
                    {gymImages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-green-600 font-medium">{gymImages.length} photo(s) selected</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Documents */}
                <div className="space-y-2">
                  <Label htmlFor="verificationDocs">Business Verification Documents *</Label>
                  <div className="border-2 border-dashed border-red-200 rounded-lg p-6 text-center bg-red-50">
                    <FileText className="mx-auto h-12 w-12 text-red-400" />
                    <div className="mt-4">
                      <Label htmlFor="verificationDocs" className="cursor-pointer">
                        <span className="text-red-600 hover:text-red-500">Upload business documents</span>
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
                      Upload business license, insurance, permits (PDF, JPG, PNG)
                    </p>
                    {verificationDocs.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-green-600 font-medium">
                          {verificationDocs.length} document(s) selected
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Required Documents:</strong> Business license, liability insurance, health department
                      permits, and any other relevant certifications.
                    </p>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="space-y-2">
                  <Label htmlFor="membershipFee">Monthly Membership Fee (USD) *</Label>
                  <Input
                    id="membershipFee"
                    type="number"
                    min="10"
                    max="500"
                    placeholder="Enter monthly membership fee"
                    required
                  />
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
                      I understand that my gym will be reviewed and verified before being listed on the platform
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="commission" required />
                    <Label htmlFor="commission" className="text-sm">
                      I agree to the platform commission structure and payment terms
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Submit Gym Registration
                </Button>

                <div className="text-center">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-red-600 hover:text-red-500 underline">
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
