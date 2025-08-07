"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppLogo } from "@/components/AppLogo";
import axios from "axios"

export default function UserSignup() {
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const [profileImg, setProfileImg] = useState<File | null>(null)
  const [gender, setGender] = useState("");

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);

  if (date) formData.append("birthday", date.toISOString());
  formData.append("gender", gender);
  if (profileImg) formData.append("profileImg", profileImg);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/signup/user`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
      }}
    );
    if (response.status === 200 || response.status === 201) {
      router.push("/dashboard/user");
    } else {
      console.error("Unexpected response:", response.data);
    }
};

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <AppLogo />
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-black">Create User Account</CardTitle>
              <CardDescription className="text-gray-600">
                Join FitConnect and start your fitness journey today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-6" onSubmit={handleFormSubmit}>
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-600">*</span></Label>
                    <Input id="firstName" name="firstName" placeholder="Enter your first name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="LastName">Last Name <span className="text-red-600">*</span></Label>
                    <Input id="LastName" name="LastName" placeholder="Enter your last name" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-600">*</span></Label>
                  <Input id="email" name="email" type="email" placeholder="Enter your email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-600">*</span></Label>
                  <Input id="password" name="password" type="password" placeholder="Create a strong password" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-600">*</span></Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNo">Contact Number <span className="text-red-600">*</span></Label>
                  <Input id="phonetNo" name="phoneNo" type="tel" placeholder="Enter your phone number" required />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label>Date of Birth <span className="text-red-600">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select your date of birth"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label>Gender <span className="text-red-600">*</span></Label>
                  <Select onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Physical Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" name="weight" type="number" placeholder="Enter your weight" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input id="height" name="height" type="number" placeholder="Enter your height" />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address <span className="text-red-600">*</span></Label>
                  <Textarea id="address" name="address" placeholder="Enter your full address" className="min-h-[100px]" required />
                </div>

                {/* Profile Image */}
                <div className="space-y-2">
                  <Label htmlFor="profileImg">Profile Image (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="profileImg" className="cursor-pointer">
                        <span className="text-red-600 hover:text-red-500">Upload a file</span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </Label>
                      <Input
                        id="profileImg"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setProfileImg(e.target.files?.[0] || null)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                    {profileImg && <p className="text-sm text-green-600 mt-2">Selected: {profileImg.name}</p>}
                  </div>
                </div>

                {/* Terms and Conditions */}
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

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Create Account
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
