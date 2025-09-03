"use client"

import React, { useState } from "react"
import { Save, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { UpdateUserDetails } from "@/lib/api"
import { PersonalInfo, FitnessData } from "./components"
import { useUserData } from "../context/UserContext"

export default function ProfilePage() {
  const { getUserProfileId } = useAuth()
  const { userData, isLoading, refreshUserData, updateUserData } = useUserData()
  const [isEditing, setIsEditing] = useState(false)
  const [localUserData, setLocalUserData] = useState<any>({})

  // Update local state when context data changes
  React.useEffect(() => {
    if (userData) {
      setLocalUserData(userData)
    }
  }, [userData])

  // Save updated details
  async function handleSave() {
    try {
      const customerId = await getUserProfileId()
      if (!customerId) return

      await UpdateUserDetails(customerId, localUserData)
      
      // Update the context with new data
      updateUserData(localUserData)
      
      // Refresh from server to get latest data
      await refreshUserData()
      
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
        <div className="container mx-auto px-4 py-12">
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
            {isLoading ? (
              <div className="space-y-8">
                <div className="animate-pulse">
                  <div className="bg-gray-800 h-64 rounded-lg"></div>
                </div>
                <div className="animate-pulse">
                  <div className="bg-gray-800 h-48 rounded-lg"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Personal Information Section */}
                <PersonalInfo userData={localUserData} setUserData={setLocalUserData} isEditing={isEditing} />
                
                {/* Fitness Data Section */}
                <FitnessData userData={localUserData} setUserData={setLocalUserData} isEditing={isEditing} />
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
