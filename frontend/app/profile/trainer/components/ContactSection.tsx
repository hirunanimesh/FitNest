"use client"
import React, { useState, useEffect } from "react"
import FeedbackModel from "./FeedbackModel"
import ReportModal from "../../components/ReportModal"
import ReportButton from "@/components/ReportButton"  
import { useTrainerData } from "../context/TrainerContext"
import { useAuth } from "@/contexts/AuthContext"

type Props = {
  targetId?: string
}

export default function ContactSection({ targetId }: Props) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [customerId, setCustomerId] = useState<number | null>(null)

  const { getUserProfileId } = useAuth()

  useEffect(() => {
    const fetchCustomerId = async () => {
      try {
        const id = await getUserProfileId()
        setCustomerId(id)
      } catch (err) {
        console.error("Failed to fetch customerId", err)
      }
    }

    fetchCustomerId()
  }, [getUserProfileId])

  // prefer trainer id from context when available
  const { trainerData } = useTrainerData()
  const contextTrainerId = trainerData?.id

  return (
    <section id="contact" className="py-5 bg-black">
      <div className="container mx-auto px-4">
        <div className="w-full flex justify-center">
          <div className="flex gap-5 items-center">
            {/* Feedback pill */}
            <button
              aria-label="Open feedback"
              onClick={() => setShowFeedback(true)}
              className="flex items-center gap-3 px-4 py-2 rounded-full bg-blue-900/60 text-gray-200 hover:bg-blue-900/80 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">Feedback</span>
            </button>

            <ReportButton
              ariaLabel="Report trainer"
              label="Report"
              onClick={() => setShowReport(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFeedback && (
        <FeedbackModel
          show={showFeedback}
          onClose={() => setShowFeedback(false)}
          trainerId={contextTrainerId}
          customerId={customerId}
        />
      )}

      {showReport && (
        <ReportModal
          show={showReport}
          onClose={() => setShowReport(false)}
          targetId={contextTrainerId}
          customerId={customerId}
          targetType="trainer"
        />
      )}
    </section>
  )
}
