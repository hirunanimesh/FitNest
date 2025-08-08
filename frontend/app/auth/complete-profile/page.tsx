"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { AppLogo } from "@/components/AppLogo"
import { supabase } from "@/lib/supabase"
import { CompleteOAuthProfile } from "@/lib/api"

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

export default function CompleteProfile() {
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  //const [profileImage, setProfileImage] = useState<File | null>(null)
  const [gender, setGender] = useState("")
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [address, setAddress] = useState("")
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prefilledData, setPrefilledData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImageUrl: ""
  })
  const [userRole, setUserRole] = useState("")

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No session, redirect to login
        router.push("/auth/login");
        return;
      }

      setUser(session.user);
      
      // Check for role in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const roleFromUrl = urlParams.get('role');
      if (roleFromUrl) {
        setUserRole(roleFromUrl);
      }
      
      // Pre-fill data from Google OAuth
      const fullName = session.user.user_metadata?.full_name || "";
      const nameParts = fullName.split(" ");
      
      setPrefilledData({
        firstName: session.user.user_metadata?.given_name || nameParts[0] || "",
        lastName: session.user.user_metadata?.family_name || nameParts.slice(1).join(" ") || "",
        email: session.user.email || "",
        profileImageUrl: session.user.user_metadata?.picture || ""
      });
    };

    checkUserSession();
  }, [router]);

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

    if (!user) {
      console.error("No user session found");
      setIsLoading(false);
      return;
    }

    if (!userRole) {
      alert("Please select your role");
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget)
    
    // Create a new FormData and add only the necessary fields
    const submitData = new FormData()
    
    // Add form fields
    submitData.append("user_id", user.id)
    submitData.append("firstName", formData.get("firstName") as string)
    submitData.append("lastName", formData.get("lastName") as string)
    submitData.append("phoneNo", formData.get("phoneNo") as string)
    submitData.append("gender", gender)
    submitData.append("birthday", date ? date.toISOString() : "")
    submitData.append("location", location ? JSON.stringify(location) : "")
    submitData.append("address", address)
    submitData.append("weight", formData.get("weight") as string || "")
    submitData.append("height", formData.get("height") as string || "")
    submitData.append("userRole", userRole) // Add the selected role
    submitData.append("profileImage", prefilledData.profileImageUrl || "")

    // Add the profile image if it exists
    // if (profileImage) {
    //   submitData.append("profileImage", profileImage)
    // }


    try {
      await CompleteOAuthProfile(submitData)
      console.log("OAuth profile completed successfully")
      
      // Redirect based on user role
      switch (userRole) {
        case "customer":
          router.push("/dashboard/user")
          break;
        case "trainer":
          router.push("/dashboard/trainer")
          break;
        case "gym":
          router.push("/dashboard/gym")
          break;
        default:
          router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error completing OAuth profile:", error)
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AppLogo />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <AppLogo />
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-black">Complete Your Profile</CardTitle>
              <CardDescription className="text-gray-600">
                Welcome to FitConnect! Please complete your profile to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-6" onSubmit={handleFormSubmit}>
                {/* Display OAuth info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Connected with Google:</strong> {prefilledData.email}
                  </p>
                  {prefilledData.profileImageUrl && (
                    <div className="mt-2">
                      <img 
                        src={prefilledData.profileImageUrl} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                  )}
                </div>

                {/* Role Selection
                <div className="space-y-2">
                  <Label>I want to join as *</Label>
                  <Select 
                    onValueChange={setUserRole} 
                    value={userRole}
                    required 
                    disabled={isLoading || !!new URLSearchParams(window.location.search).get('role')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">🏃‍♂️ Customer</SelectItem>
                      <SelectItem value="trainer">💪 Trainer</SelectItem>
                      <SelectItem value="gym">🏋️‍♀️ Gym Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  {new URLSearchParams(window.location.search).get('role') && (
                    <p className="text-xs text-muted-foreground">
                      Role pre-selected from Google signup
                    </p>
                  )}
                </div> */}

                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      placeholder="Enter your first name" 
                      defaultValue={prefilledData.firstName}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      placeholder="Enter your last name" 
                      defaultValue={prefilledData.lastName}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNo">Contact Number *</Label>
                  <Input id="phoneNo" name="phoneNo" type="tel" placeholder="Enter your phone number" required disabled={isLoading} />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick your birth date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select onValueChange={setGender} required disabled={isLoading}>
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
                    <Input id="weight" name="weight" type="number" placeholder="Your weight" disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input id="height" name="height" type="number" placeholder="Your height" disabled={isLoading} />
                  </div>
                </div>

                {/* Profile Image */}
                {/* <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Picture (Optional)</Label>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    disabled={isLoading}
                  />
                </div> */}

                {/* Location */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openLocationSelector}
                      className="w-full"
                      disabled={isLoading}
                    >
                      {location ? "Change Location" : "Select Location"}
                    </Button>
                  </div>
                  {address && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {address}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                  {isLoading ? "Completing Profile..." : "Complete Profile"}
                </Button>
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
