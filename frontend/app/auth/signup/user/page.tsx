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
import { CalendarIcon, Upload, MapPin, ArrowLeft, User, Mail, Lock, Phone, Camera } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AddCustomer } from "@/lib/api"

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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl max-w-4xl w-full mx-4 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Select Your Location</h3>
            <Button 
              variant="outline" 
              onClick={() => setIsMapOpen(false)}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Close
            </Button>
          </div>
          <div 
            ref={mapRef}
            className="w-full h-96 rounded-lg border border-gray-700"
          />
          <p className="text-sm text-gray-400 mt-4 text-center">
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
                <User className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Create Your Account
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Join FitConnect and start your fitness journey today
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <form className="space-y-6" onSubmit={handleFormSubmit}>
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-300">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        placeholder="Enter your first name" 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="LastName" className="text-gray-300">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="LastName" 
                        name="LastName" 
                        placeholder="Enter your last name" 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                        required 
                      />
                    </div>
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
                    <Label htmlFor="phoneNo" className="text-gray-300">
                      Contact Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input 
                        id="phoneNo" 
                        name="phoneNo" 
                        type="tel" 
                        placeholder="Enter your phone number" 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pl-10"
                        required 
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Basic Details Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Basic Details</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select your date of birth"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                          <Calendar 
                            mode="single" 
                            selected={date} 
                            onSelect={setDate} 
                            initialFocus 
                            className="bg-gray-800 text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select onValueChange={setGender} required>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="male" className="text-white hover:bg-gray-700">Male</SelectItem>
                          <SelectItem value="female" className="text-white hover:bg-gray-700">Female</SelectItem>
                          <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="gender" value={gender} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-gray-300">Weight (kg)</Label>
                      <Input 
                        id="weight" 
                        name="weight" 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="500" 
                        placeholder="e.g., 70.5" 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-gray-300">Height (cm)</Label>
                      <Input 
                        id="height" 
                        name="height" 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="300" 
                        placeholder="e.g., 175.5" 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
                      />
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
                    <Label htmlFor="address" className="text-gray-300">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <Textarea 
                          id="address" 
                          name="address" 
                          placeholder="Enter your full address" 
                          className="min-h-[100px] flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required 
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={openLocationSelector}
                          className="h-fit mt-0 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white px-4"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          Map
                        </Button>
                      </div>
                      {location && (
                        <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
                          <p className="text-sm text-green-400">
                            📍 Location selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
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
                      <Label htmlFor="profileImg" className="cursor-pointer">
                        <span className="text-red-500 hover:text-red-400 font-medium">Upload a file</span>
                        <span className="text-gray-400"> or drag and drop</span>
                      </Label>
                      <Input
                        id="profileImg"
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

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
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

                {/* Hidden inputs for additional data */}
                <input type="hidden" name="birthday" value={date ? date.toISOString() : ""} />
                <input type="hidden" name="location" value={location ? JSON.stringify(location) : ""} />

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
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
        
        {/* Map Modal */}
        {isMapOpen && <MapSelector />}
      </div>
    </div>
  )
}