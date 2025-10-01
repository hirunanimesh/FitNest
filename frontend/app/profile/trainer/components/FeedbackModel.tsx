"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import { useTrainerData } from "../context/TrainerContext";
import { SendFeedback } from "@/lib/api"

type Props = {
  show?: boolean
  onClose?: () => void
  trainerId?: string | null
  customerId?: number | null
}

export default function FeedbackModel({ show, onClose, trainerId: trainerIdProp, customerId: customerIdProp }: Props) {
  const [form, setForm] = useState({ message: "" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [trainerId, setTrainerId] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<number | null>(null)
  const { refreshTrainerData } = useTrainerData()

  useEffect(() => {

    if (trainerIdProp) {
      setTrainerId(trainerIdProp)
    } 

    // Use customerId supplied by parent (ContactSection). If not provided, customerId will remain null.
    if (customerIdProp) {
      setCustomerId(customerIdProp)
    }
  }, [trainerIdProp, customerIdProp])

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // ensure we have a trainer id before sending
      if (!trainerId) {
        alert("Unable to send feedback: missing trainer id.")
        setSubmitting(false)
        return
      }
      // prefer centralized API helper
      await SendFeedback(String(trainerId), customerId, form.message)

      setSubmitted(true)
      setForm({ message: "" })
      try {
        await refreshTrainerData()
      } catch (e) {
        // ignore refresh errors
      }
      setTimeout(() => setSubmitted(false), 2000)

      // If used as a modal, close after success
      if (onClose) setTimeout(() => onClose(), 1400)
    } catch (err) {
      alert("Failed to send message. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const isModal = typeof show !== "undefined"
  if (isModal && !show) return null

  const content = (
    <div className="w-full max-w-lg">
      {submitted ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 bg-gray-900 rounded-full flex items-center justify-center">
            <svg
              className="w-16 h-16"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="26"
                cy="26"
                r="25"
                stroke="#065F46"
                strokeWidth="2"
                fill="none"
                className="circle"
              />
              <path
                d="M14 27.5L22 34L38 18"
                stroke="#10B981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="check"
              />
            </svg>
          </div>

      <h3 className="text-white text-lg font-semibold">Thank you for your feedback</h3>
      <p className="text-gray-300 text-sm max-w-sm text-center">
        We appreciate your input. We'll review it and get back if needed.
      </p>
    </div>
  
      ) : (
       
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="message" className="text-gray-300">Message</Label>
            <textarea
              id="message"
              name="message"
              value={form.message}
                onChange={handleChange}
                required
                placeholder="Write your message here..."
                className="w-full mt-1 p-3 rounded-md bg-gray-900 text-white border border-gray-700 resize-none"
                rows={5}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-red-600 hover:bg-red-700">
            Send Message
          </Button>
        </form>
       
      )}
    </div>
   
  )

  if (isModal) {
    return (
      <div>
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg z-50">
            <div className="flex flex-col items-center justify-center mb-4 text-center relative">
            <h4 className="text-2xl text-white font-semibold">Send Feedback</h4>
            <button aria-label="Close feedback" onClick={onClose} className="absolute right-0 top-0 text-gray-200 hover:text-white p-1">✕</button>
            </div>
          {content}
        </div>
      </div>
      {/* Put this style block inside the component render (React will accept a <style> tag) */}
      <style>{`
        .circle {
          stroke-dasharray: 157;
          stroke-dashoffset: 157;
          transform-origin: 50% 50%;
          animation: circle-draw 700ms ease-out forwards;
        }
        .check {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: check-draw 500ms 500ms ease-out forwards;
          opacity: 0;
        }
        @keyframes circle-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes check-draw {
          0% { stroke-dashoffset: 80; opacity: 0; transform: scale(0.95); }
          60% { opacity: 1; transform: scale(1.03); }
          100% { stroke-dashoffset: 0; opacity: 1; transform: scale(1); }
        }
      `}
      </style>
    </div>
        )
      }

  
}