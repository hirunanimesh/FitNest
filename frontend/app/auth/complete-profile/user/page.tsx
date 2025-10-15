"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { MapPinIcon } from "lucide-react"
import { AppLogo } from "@/components/AppLogo"
import { supabase } from "@/lib/supabase"
import { CompleteOAuthProfileMember } from "@/lib/api"
import GoogleMapPicker from "@/components/GoogleMapPicker"
import { PublicRoute } from "@/components/PublicRoute"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"

export default function CompleteProfile() {
  const router = useRouter()
  const { refreshUserRole } = useAuth()
  const [date, setDate] = useState<Date>()
  const [dateInput, setDateInput] = useState("")
  const [gender, setGender] = useState("")
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [prefilledData, setPrefilledData] = useState({
    firstName: "",
    lastName: "",
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

      setUser(session.user);
      
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

  // Handle date input changes
  const handleDateInputChange = (value: string) => {
    // Allow only numbers and forward slashes
    const formattedValue = value.replace(/[^\d/]/g, '')
    
    // Auto-format DD/MM/YYYY
    let formatted = formattedValue
    if (formattedValue.length >= 2 && formattedValue.indexOf('/') === -1) {
      formatted = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2)
    }
    if (formattedValue.length >= 5 && formattedValue.split('/').length === 2) {
      const parts = formattedValue.split('/')
      formatted = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2)
    }
    
    // Limit to DD/MM/YYYY format
    if (formatted.length > 10) {
      formatted = formatted.slice(0, 10)
    }
    
    setDateInput(formatted)
    
    // Parse DD/MM/YYYY format
    if (formatted.length === 10 && formatted.split('/').length === 3) {
      const [day, month, year] = formatted.split('/')
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      
      // Validate the date
      if (!isNaN(parsedDate.getTime()) && 
          parsedDate.getDate() === parseInt(day) &&
          parsedDate.getMonth() === parseInt(month) - 1 &&
          parsedDate.getFullYear() === parseInt(year)) {
        setDate(parsedDate)
      } else {
        setDate(undefined)
      }
    } else {
      setDate(undefined)
    }
  }

  // Handle location selection from GoogleMapPicker
  const handleLocationSelect = (selectedLocation: {lat: number, lng: number, address: string}) => {
    setLocation(selectedLocation)
    setIsMapOpen(false)
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Submitting form with data:')
    if (!user) {
      console.error("No user session found");
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
    submitData.append("location", location ? JSON.stringify({lat: location.lat, lng: location.lng}) : "")
    submitData.append("address", location?.address || "")
    submitData.append("weight", formData.get("weight") as string || "")
    submitData.append("height", formData.get("height") as string || "")
    submitData.append("userRole", "customer") // Add the selected role
    submitData.append("profileImage", prefilledData.profileImageUrl || "")

    //validate phoneNO
    const phoneNo = formData.get("phoneNo") as string;
    const phoneRegex = /^\d{10}$/; // exactly 10 digits
    if (!phoneRegex.test(phoneNo)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
      });
      setIsLoading(false);
      return;
    }

    try {
      
      const result = await CompleteOAuthProfileMember(submitData)
      
      // Check if user already exists
      if (result && result.alreadyExists) {
        alert("Your profile already exists! You are already registered. Please login instead.");
        // Redirect to dashboard since user is already registered
        return;
      }
      
      console.log("OAuth profile completed successfully")
      
      // Refresh the user role in the context before redirecting
      await refreshUserRole()
      
      // Force a page refresh to ensure the auth context is updated
      window.location.href = '/auth/login'
      
    } catch (error: any) {
      console.error("Error completing OAuth profile:", error)
      // Check if the error response contains the already exists message
      if (error.response?.data?.alreadyExists) {
        alert("Your profile already exists! You are already registered. Please login instead.");
      } else {
        alert("An error occurred while completing your profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
    <PublicRoute>
      <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <AppLogo />
        </div>
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-500/20 bg-gray-800/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center border-b border-gray-700/50">
              <CardTitle className="text-3xl font-bold text-white">Complete Your Profile</CardTitle>
              <CardDescription className="text-gray-300">
                Welcome to FitConnect! Please complete your profile to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <form className="space-y-6" onSubmit={handleFormSubmit}>
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

                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-200">First Name *</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      placeholder="Enter your first name" 
                      defaultValue={prefilledData.firstName}
                      required 
                      disabled={isLoading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-200">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      placeholder="Enter your last name" 
                      defaultValue={prefilledData.lastName}
                      required 
                      disabled={isLoading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNo" className="text-gray-200">Contact Number *</Label>
                  <Input 
                    id="phoneNo" 
                    name="phoneNo" 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    required 
                    disabled={isLoading}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20"
                  />
                </div>

                {/* Simplified Date of Birth - Only Calendar A */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Date of Birth *</Label>
                  <Input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={dateInput}
                    onChange={(e) => handleDateInputChange(e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white focus:border-red-500 focus:ring-red-500/20"
                    disabled={isLoading}
                    required
                    maxLength={10}
                  />
                  {date && (
                    <p className="text-sm text-gray-400">
                      Selected: {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                  {dateInput && !date && dateInput.length === 10 && (
                    <p className="text-sm text-red-500">
                      Please enter a valid date in DD/MM/YYYY format
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Gender *</Label>
                  <Select onValueChange={setGender} required disabled={isLoading}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white focus:border-red-500 focus:ring-red-500/20">
                      <SelectValue placeholder="Select your gender" className="text-gray-400" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="male" className="text-white hover:bg-gray-700 focus:bg-gray-700">Male</SelectItem>
                      <SelectItem value="female" className="text-white hover:bg-gray-700 focus:bg-gray-700">Female</SelectItem>
                      <SelectItem value="other" className="text-white hover:bg-gray-700 focus:bg-gray-700">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Physical Information with decimal support */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-gray-200">Weight (kg)</Label>
                    <Input 
                      id="weight" 
                      name="weight" 
                      type="number" 
                      step="0.1"
                      min="0"
                      max="500"
                      placeholder="e.g. 70.5" 
                      disabled={isLoading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-gray-200">Height (cm)</Label>
                    <Input 
                      id="height" 
                      name="height" 
                      type="number" 
                      step="0.1"
                      min="0"
                      max="300"
                      placeholder="e.g. 175.5" 
                      disabled={isLoading}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-gray-200">Location</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMapOpen(true)}
                    className="w-full justify-start bg-gray-700/50 border-gray-600 text-gray-200 hover:bg-gray-600/50 hover:text-white"
                    disabled={isLoading}
                  >
                    <MapPinIcon className="mr-2 h-4 w-4" />
                    {location ? "Change Location" : "Select Location"}
                  </Button>
                  {location?.address && (
                    <p className="text-sm text-gray-400 mt-2">
                      📍 {location.address}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? "Completing Profile..." : "Complete Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Map Modal */}
        {isMapOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl max-w-4xl w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Select Your Location</h3>
                <Button 
                  variant="outline" 
                  onClick={() => setIsMapOpen(false)}
                  className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white"
                >
                  Close
                </Button>
              </div>
              <GoogleMapPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={location || undefined}
                searchPlaceholder="Search for your location..."
                height="400px"
              />
            </div>
          </div>
        )}
      </div>
    </div>
    </PublicRoute>
  )
}