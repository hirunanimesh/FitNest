"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Upload, Save, Edit } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter} from "next/navigation";
import { UserNavbar } from "@/components/user-navbar"
import {  GetUserInfo } from "@/lib/api"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  //const [date, setDate] = useState<Date>()
  //const [userData, setUserData] = useState({
     const router = useRouter();
    const [profileId, setProfileId] = useState<string | null>(null);
      const[userName,setUserName] = useState<string|null>(null);
      const[imgUrl,setImgUrl] = useState<string|null>(null);
      const [userData, setUserData] = useState<any>({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  dateOfBirth: null,
  gender: "",
  avatar: "",
  weight: "",
  height: "",
});
      
    useEffect(() => {
  async function fetchUserInfo() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    try {
      //const data = await GetUserInfo(token);
      //const id = data?.user?.id || null;
      //setProfileId(id);

      //if (id) {
        // Fetch user details from your API
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/user/getuserbyid/28`);//${id}
        console.log("User Data:", response.data);
        if (response.data) {
          setUserData({
            //location
            firstName: response.data.user.first_name || "",
            lastName: response.data.user.last_name || "",
            email: response.data.email || "",
            phone: response.data.user.phone_no || "",
            address: response.data.user.address || "",
            dateOfBirth: response.data.user.birthday ? new Date(response.data.birthday) : null,
            gender: response.data.user.gender || "",
            avatar: response.data.user.profile_img || "",
            weight: response.data.weight || "",
            height: response.data.height || "",
          });
        }
      }
    catch (error) {
      " ";
    }
  }
  fetchUserInfo();
}, []);
// ...existing code...

  // Add this function inside ProfilePage
  async function handleSave() {
   
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/user/updateuser/28`, // ${profileId}
        {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        date_of_birth: userData.dateOfBirth,
        gender: userData.gender,
        avatar: userData.avatar,
        weight: userData.weight,
        height: userData.height,
      });
      setIsEditing(false);
    } catch (error) {
      // Optionally handle error (e.g., show notification)
      setIsEditing(false);
    }
  }

// ...existing code...
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="bg-black-400 min-h-screen">
    <div className="min-h-screen bg-black text-white">
      <UserNavbar />

      <div className="container mx-auto p-6  ">
        <div className="max-w-4xl mx-auto ">
          <div className="flex justify-between items-center mb-8 ">
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              variant={isEditing ? "default" : "outline"}
              style={{ backgroundColor: "red" }}
            >
              {isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>

          <Tabs defaultValue="personal" className="w-full " >
            <TabsList className="grid w-full grid-cols-3 bg-[#192024]">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="fitness">Fitness Data</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6 bg-[#192024]">
              <Card className="bg-[#192024] text-white" >
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userData.avatar || "/placeholder.svg"} alt="Profile" />
                      <AvatarFallback className="text-lg">
                        {userData.firstName[0]}
                        {userData.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div>
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Change Photo
                        </Button>
                        <p className="text-sm text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                      </div>
                    )}
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4 ">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value ={userData.firstName}
                        onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                        disabled={!isEditing}
                        className="bg-[#192024] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={userData.lastName}
                        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                        disabled={!isEditing}
                        className="bg-[#192024] text-white"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        disabled={!isEditing}
                        className="bg-[#192024] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="bg-[#192024] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={userData.address}
                        onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                        disabled={!isEditing}
                        className="bg-[#192024] text-white"
                      />
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      {isEditing ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !userData.dateOfBirth && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {userData.dateOfBirth ? format(userData.dateOfBirth, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={userData.dateOfBirth || undefined}
                              onSelect={(date) => date && setUserData({ ...userData, dateOfBirth: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input
  value={
    userData.dateOfBirth && !isNaN(new Date(userData.dateOfBirth).getTime())
      ? format(new Date(userData.dateOfBirth), "PPP")
      : ""
  }
  disabled
/>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      {isEditing ? (
                        <Select
                          value={userData.gender}
                          onValueChange={(value) => setUserData({ ...userData, gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input value={userData.gender} disabled />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fitness" className="space-y-6">
              <Card className="bg-[#192024] text-white">
                <CardHeader>
                  <CardTitle>Fitness Metrics</CardTitle>
                  <CardDescription>Track your physical measurements and fitness goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Current Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={userData.weight}
                        onChange={(e) => setUserData({ ...userData, weight: e.target.value })}
                        disabled={!isEditing}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={userData.height}
                        onChange={(e) => setUserData({ ...userData, height: e.target.value })}
                        disabled={!isEditing}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* BMI Display */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Current BMI</p>
                        <p className="text-2xl font-bold">
                          {(
                            Number.parseFloat(userData.weight) /
                              Math.pow(Number.parseFloat(userData.height) / 100, 2) || 0
                          ).toFixed(1)}
                        </p>
                      </div>
                      <Badge variant="secondary">Normal Range</Badge>
                    </div>
                  </div>

                  {/* Fitness Goals */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Fitness Goals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                        <Input id="targetWeight" type="number" placeholder="70" disabled={!isEditing} min="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fitnessGoal">Primary Goal</Label>
                        {isEditing ? (
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your goal" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weight-loss">Weight Loss</SelectItem>
                              <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="endurance">Endurance</SelectItem>
                              <SelectItem value="strength">Strength</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input placeholder="Weight Loss" disabled />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card className="bg-[#192024] text-white">
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>Customize your experience and notification settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Workout Reminders</p>
                          <p className="text-sm text-muted-foreground">Get notified about scheduled workouts</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Progress Updates</p>
                          <p className="text-sm text-muted-foreground">Weekly progress summaries</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Plans Available</p>
                          <p className="text-sm text-muted-foreground">Notifications about new gym and trainer plans</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Privacy</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Profile Visibility</p>
                          <p className="text-sm text-muted-foreground">Allow trainers to see your profile</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Progress Sharing</p>
                          <p className="text-sm text-muted-foreground">Share progress with your trainer</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
    </div>
    </ProtectedRoute>
  )
}
