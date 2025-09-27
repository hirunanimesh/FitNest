"use client"
import React, { useState, useEffect } from "react"
import FeedbackModel from "./FeedbackModel"
import ReportModal from "./ReportModal"
import { supabase } from "@/lib/supabase"
import { GetUserInfo } from "@/lib/api"

type Props = {
  trainerId?: string
}

export default function ContactSection({ trainerId }: Props) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)

  // ensure trainerId is available as string for FeedbackModel (it accepts string or number)
  const trainerIdStr = trainerId ? String(trainerId) : undefined

  useEffect(() => {
    async function fetchUserInfo() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      try {
        const data = await GetUserInfo(token)
        const profileId = data?.user?.id || null
        setProfileId(profileId)
        if (profileId) {
          const { data: customerData, error } = await supabase
            .from("customer")
            .select("id")
            .eq("user_id", profileId)
            .single()

          if (error || !customerData) {
            setCustomerId(null)
          } else {
            setCustomerId(customerData.id)
          }
        }
      } catch (err) {
        setProfileId(null)
        setCustomerId(null)
      }
    }

    fetchUserInfo()
  }, [])

  return (
    <section id="contact" className="py-5 bg-black">
      {/* ...existing contact section could go here... */}

      {/* Permanent buttons in bottom-right area (not fixed) */}
      <div className="container mx-auto px-4">
        <div className="w-full flex justify-end">
          <div className="flex gap-5 items-center">
          {/* Feedback pill */}
          <button
            aria-label="Open feedback"
            onClick={() => setShowFeedback(true)}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-blue-900/60 text-gray-200 hover:bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">Feedback</span>
          </button>

          {/* Report pill with glowing outline */}
          <button
            aria-label="Report trainer"
            onClick={() => setShowReport(true)}
            className="relative flex items-center gap-3 px-5 py-2 rounded-full bg-red-900 text-red-100 hover:bg-red-800 focus:outline-none"
            style={{ boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.06), inset 0 0 0 1px rgba(239,68,68,0.12)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7l9-4 9 4v7a9 9 0 01-9 9 9 9 0 01-9-9V7z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.5 12.5l5 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">Report</span>
          </button>
          </div>
        </div>
      </div>

      {/* Use the existing FeedbackModel and ReportModal components */}
      {showFeedback && (
        <FeedbackModel show={showFeedback} onClose={() => setShowFeedback(false)} trainerId={trainerIdStr} customerId={customerId} />
      )}

      <ReportModal
        show={showReport}
        onClose={() => setShowReport(false)}
        trainerId={trainerId ? parseInt(trainerId, 10) : undefined}
        customerId={customerId}
      />
    </section>
  )
}
