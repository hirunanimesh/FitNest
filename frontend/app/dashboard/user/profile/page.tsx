"use client"

import { useState, useEffect } from "react"
import { Save, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserNavbar } from "@/components/user-navbar"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { GetCustomerById, UpdateUserDetails } from "@/lib/api"
import { PersonalInfo, FitnessData } from "./components"

export default function ProfilePage() {
  const { getUserProfileId } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    avatar: "",
    weight: "",
    height: "",
  })

  useEffect(() => {
    fetchUserInfo()
  }, [getUserProfileId])

  // Fetch user data
  async function fetchUserInfo() {
    try {
      const customerId = await getUserProfileId()
      if (!customerId) return

      const data = await GetCustomerById(customerId)
      const customerData = data.user

      if (customerData) {
        setUserData({
          firstName: customerData.first_name || "",
          lastName: customerData.last_name || "",
          phone: customerData.phone_no || "",
          address: customerData.address || "",
          dateOfBirth: customerData.birthday || "",
          gender: customerData.gender || "",
          avatar: customerData.profile_img || "",
        })
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  // Save updated details
  async function handleSave() {
    try {
      const customerId = await getUserProfileId()
      if (!customerId) return

      await UpdateUserDetails(customerId, userData)
      await fetchUserInfo()
      setIsEditing(false)
    } catch (error: any) {
      console.error("Full error object:", error)
      alert("Failed to update profile. Please try again.")
      setIsEditing(false)
    }
  }

  // Handle edit/save button click
  function handleButtonClick() {
    if (isEditing) {
      handleSave()
    } else {
      setIsEditing(true)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-black text-white">
        <UserNavbar />

        <div className="container mx-auto px-4 py-12 mt-12">
          <div className="max-w-4xl mx-auto">
            {/* Header with edit/save button */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
                <p className="text-gray-400">Manage your personal information and preferences</p>
              </div>

              <Button
                onClick={handleButtonClick}
                variant={isEditing ? "default" : "outline"}
                className={
                  isEditing
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-700 text-white hover:bg-red-600 hover:text-white border-gray-700"
                }
              >
                {isEditing ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4 " />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            {/* Profile Sections */}
            <div className="space-y-8">
              {/* Personal Information Section */}
              <PersonalInfo userData={userData} setUserData={setUserData} isEditing={isEditing} />
              
              {/* Fitness Data Section */}
              <FitnessData userData={userData} setUserData={setUserData} isEditing={isEditing} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
