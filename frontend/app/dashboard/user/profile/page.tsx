"use client"

import React, { useState, useRef, useCallback } from "react"
import { Save, Edit, QrCode, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  const [qrOpen, setQrOpen] = useState(false)
  const [qrValue, setQrValue] = useState<string>("")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

  // Deterministic QR payload builder: ensure same input -> same QR.
  // Storing only customer_id keeps it simple; you can extend with versioning or signature later.
  const buildQrPayload = useCallback((customerId: string) => {
    return JSON.stringify({ type: "gym_entry", customer_id: customerId })
  }, [])

  // Lightweight QR generation (no extra lib) using a tiny inline implementation (error correction level L).
  // For production-grade with logos/error correction use a library like 'qrcode'.
  const generateQrOnCanvas = useCallback(async (text: string) => {
    if (!canvasRef.current) return
    const QR = (await import('qrcode')).default
    await QR.toCanvas(canvasRef.current, text, {
      margin: 1,
      scale: 6,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  }, [])

  const openQrDialog = async () => {
  const customerId = await getUserProfileId()
    if (!customerId) return
  const payload = buildQrPayload(String(customerId))
    setQrValue(payload)
    setQrOpen(true)
    // Defer to next paint so canvas exists
    setTimeout(() => generateQrOnCanvas(payload), 50)
  }

  const downloadQr = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'gym-entry-qr.png'
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
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
              <div className="flex gap-3">
                <Button
                  onClick={openQrDialog}
                  variant="outline"
                  className="bg-gray-700 text-white hover:text-white hover:bg-red-600 border-gray-700"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  My Entry QR
                </Button>
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

      {/* QR Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-[420px] bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Your Gym Entry QR</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <canvas ref={canvasRef} width={300} height={300} className="rounded bg-black border border-gray-700" />
          </div>
          <DialogFooter className="flex gap-2">
            <Button onClick={downloadQr} className="bg-red-600 hover:bg-red-700 text-white w-full">
              <Download className="mr-2 h-4 w-4" /> Download QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
