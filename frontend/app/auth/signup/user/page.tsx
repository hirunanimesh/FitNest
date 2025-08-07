"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, MapPin } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AddCustomer } from "@/lib/api"
import { supabase } from "@/lib/supabase"

import { AppLogo } from "@/components/AppLogo";

export default function UserSignup() {
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [gender, setGender] = useState("")
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [address, setAddress] = useState("")
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load Google Maps script
  const loadGoogleMapsScript = useCallback(() => {
    if (window.google || mapLoaded) return Promise.resolve()
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        setMapLoaded(true)
        resolve(true)
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }, [mapLoaded])

  const openLocationSelector = async () => {
    try {
      await loadGoogleMapsScript()
      setIsMapOpen(true)
    } catch (error) {
      console.error("Error loading Google Maps:", error)
    }
  }

  const handleMapClick = async (lat: number, lng: number) => {
    setLocation({ lat, lng })
    
    // Get address from coordinates using Google Geocoding API
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address)
      }
    } catch (error) {
      console.error("Error getting address:", error)
    }
    
    setIsMapOpen(false)
  }

  // Google Map Component
  const MapSelector = () => {
    const mapRef = useRef<HTMLDivElement | null>(null)
    
    useEffect(() => {
      if (!mapRef.current || !window.google) return
      
      // Center on Sri Lanka
      const sriLankaCenter = { lat: 7.8731, lng: 80.7718 }
      
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 7,
        center: sriLankaCenter,
        mapTypeId: 'roadmap'
      })
      
      // Add click listener
      map.addListener('click', (event: any) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        handleMapClick(lat, lng)
      })
      
      // Add marker for current location if exists
      if (location) {
        new window.google.maps.Marker({
          position: location,
          map: map,
          title: 'Selected Location'
        })
      }
    }, [location])
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Select Your Location</h3>
            <Button variant="outline" onClick={() => setIsMapOpen(false)}>
              Close
            </Button>
          </div>
          <div 
            ref={mapRef}
            className="w-full h-96 rounded-lg"
          />
          <p className="text-sm text-gray-600 mt-2">
            Click on the map to select your location
          </p>
        </div>
      </div>
    )
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);

    const formData = new FormData(e.currentTarget)
    
    // Create a new FormData and add only the necessary fields
    const submitData = new FormData()
    
    // Add form fields
    submitData.append("firstName", formData.get("firstName") as string)
    submitData.append("lastName", formData.get("LastName") as string)
    submitData.append("email", formData.get("email") as string)
    submitData.append("password", formData.get("password") as string)
    submitData.append("confirmPassword", formData.get("confirmPassword") as string)
    submitData.append("phoneNo", formData.get("phoneNo") as string)
    submitData.append("role", "customer")
    submitData.append("gender", gender)
    submitData.append("birthday", date ? date.toISOString() : "")
    submitData.append("location", location ? JSON.stringify(location) : "")
    submitData.append("address", address)
    submitData.append("weight", formData.get("weight") as string || "")
    submitData.append("height", formData.get("height") as string || "")

    // Add the profile image if it exists
    if (profileImage) {
      submitData.append("profileImage", profileImage)
    }

    try {
      await AddCustomer(submitData)
      console.log("User registered successfully")
      router.push("/dashboard/user")
    } catch (error) {
      console.error("Error registering user:", error)
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/complete-profile`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) {
        console.error("Google sign-up error:", error)
        // Handle error
      }
    } catch (error) {
      console.error("Error initiating Google sign-up:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
              {/* Quick Google Sign Up */}
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleSignUp}
                  variant="outline" 
                  className="w-full bg-transparent flex items-center justify-center gap-3"
                  disabled={isLoading}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isLoading ? "Connecting with Google..." : "Quick signup with Google"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Sign up instantly and complete your profile details after
                </p>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-4">
                  Or fill out the complete registration form
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleFormSubmit}>
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-600">*</span></Label>
                    <Input id="firstName" name="firstName" placeholder="Enter your first name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="LastName">Last Name *</Label>
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
                  <Label htmlFor="phoneNo">Contact Number *</Label>
                  <Input id="phoneNo" name="phoneNo" type="tel" placeholder="Enter your phone number" required />
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
                  <Label>Gender *</Label>
                  <Select onValueChange={setGender} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="gender" value={gender} />
                </div>

                {/* Physical Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input 
                      id="weight" 
                      name="weight" 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="500" 
                      placeholder="Enter your weight (e.g., 70.5)" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input 
                      id="height" 
                      name="height" 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="300" 
                      placeholder="Enter your height (e.g., 175.5)" 
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Textarea 
                        id="address" 
                        name="address" 
                        placeholder="Enter your full address" 
                        className="min-h-[100px] flex-1" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required 
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={openLocationSelector}
                        className="h-fit mt-0"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Select on Map
                      </Button>
                    </div>
                    {location && (
                      <p className="text-sm text-green-600">
                        Location detected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
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
                        onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                    {profileImage && <p className="text-sm text-green-600 mt-2">Selected: {profileImage.name}</p>}
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

                {/* Hidden inputs for additional data */}
                <input type="hidden" name="birthday" value={date ? date.toISOString() : ""} />
                <input type="hidden" name="location" value={location ? JSON.stringify(location) : ""} />

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
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
        
        {/* Map Modal */}
        {isMapOpen && <MapSelector />}
      </div>
    </div>
  )
}
