"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"

export default function SignUpPage() {
  const [userType, setUserType] = useState("user")
  const [date, setDate] = useState<Date>()
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const searchParams = useSearchParams()
  const typeParam = searchParams.get("type")

  useEffect(() => {
    if (typeParam && ["user", "trainer", "gym"].includes(typeParam)) {
      setUserType(typeParam)
    }
  }, [typeParam])

  const getFormTitle = () => {
    switch (userType) {
      case "trainer":
        return "Join as a Trainer"
      case "gym":
        return "Join as a Gym"
      default:
        return "Join FitNest"
    }
  }

  const getFormDescription = () => {
    switch (userType) {
      case "trainer":
        return "Create your trainer profile and start helping people achieve their fitness goals."
      case "gym":
        return "Register your gym and connect with fitness enthusiasts in your area."
      default:
        return "Start your fitness journey today with personalized training and gym access."
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{getFormTitle()}</CardTitle>
          <CardDescription>{getFormDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* User Registration */}
          {userType === "user" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" placeholder="70" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" type="number" placeholder="175" min="0" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" type="tel" placeholder="+1 (555) 123-4567" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main St, City, State" />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Image (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input id="profileImage" type="file" accept="image/*" className="hidden" />
                  <Button variant="outline" onClick={() => document.getElementById("profileImage")?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Trainer Registration */}
          {userType === "trainer" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trainerName">Name with Initials</Label>
                <Input id="trainerName" placeholder="John A. Doe" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainerEmail">Email</Label>
                <Input id="trainerEmail" type="email" placeholder="trainer@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainerPassword">Password</Label>
                <Input id="trainerPassword" type="password" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainerContact">Contact Number</Label>
                <Input id="trainerContact" type="tel" placeholder="+1 (555) 123-4567" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Input id="bio" placeholder="Tell us about your experience and specializations" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainerImage">Profile Image (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input id="trainerImage" type="file" accept="image/*" className="hidden" />
                  <Button variant="outline" onClick={() => document.getElementById("trainerImage")?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification">Verification Documents</Label>
                <div className="flex items-center space-x-2">
                  <Input id="verification" type="file" accept=".pdf,.jpg,.png" multiple className="hidden" />
                  <Button variant="outline" onClick={() => document.getElementById("verification")?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload certifications, licenses, and other relevant documents
                </p>
              </div>
            </div>
          )}

          {/* Gym Registration */}
          {userType === "gym" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gymName">Gym Name</Label>
                <Input id="gymName" placeholder="FitZone Gym" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input id="ownerName" placeholder="Jane Smith" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gymEmail">Email</Label>
                <Input id="gymEmail" type="email" placeholder="info@fitzone.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gymPassword">Password</Label>
                <Input id="gymPassword" type="password" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gymPhone">Phone Number</Label>
                <Input id="gymPhone" type="tel" placeholder="+1 (555) 123-4567" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gymAddress">Location Address</Label>
                <Input id="gymAddress" placeholder="123 Fitness Ave, Health City, HC 12345" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gymVerification">Verification Documents</Label>
                <div className="flex items-center space-x-2">
                  <Input id="gymVerification" type="file" accept=".pdf,.jpg,.png" multiple className="hidden" />
                  <Button variant="outline" onClick={() => document.getElementById("gymVerification")?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload business license, insurance, and other relevant documents
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms and Conditions
              </Link>
            </Label>
          </div>

          <Button className="w-full mt-6" disabled={!agreedToTerms}>
            Create Account
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
