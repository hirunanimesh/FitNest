"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState,useEffect } from "react"
import { AddReport } from "@/lib/api"

type Props = {
  show?: boolean
  onClose?: () => void
  targetId?: string | null
  customerId?: number | null
  targetType?: "trainer" | "gym" 
}

export default function ReportModal({ show, onClose, targetId, customerId,targetType}: Props) {
  const [form, setForm] = useState({ report_type: "", subject: "", description: "" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
  if (show) {
    setSubmitted(false)
  }
}, [show])
  if (!show) return null


  function setType(type: string) {
    setForm((s) => ({ ...s, report_type: type }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await AddReport(customerId ?? null, targetId ?? null, targetType,{
        report_type: form.report_type,
        subject: form.subject,
        description: form.description,
      })

      setSubmitted(true)
      setForm({ report_type: "", subject: "", description: "" })
      setTimeout(() => setSubmitted(false), 2000)
      // auto close after success
      if (onClose) setTimeout(() => onClose(), 1400)
    } catch (err) {
      alert("Failed to send report. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

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
                stroke="#991B1B"   // darker red stroke
                strokeWidth="2"
                fill="none"
                className="circle"
              />
              <path
                d="M14 27.5L22 34L38 18"
                stroke="#DC2626"   // Tailwind red-600
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="check"
              />
            </svg>
          </div>

          <h3 className="text-white text-lg font-semibold">Thank you for submitting a report</h3>
          <p className="text-gray-300 text-sm max-w-sm text-center">
            We take reports seriously. Our support team will review it and get back to you.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-gray-300">Why are you reporting this {targetType}?</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your report is anonymous. Reports are kept confidential and help us maintain a safe community.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {["Harassment", "Spam", "Fraud", "Inappropriate Content", "Something Else"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={form.report_type === t}
                  className={`px-3 py-1 rounded-full border transition-colors duration-150  
                    ${form.report_type === t 
                      ? "bg-red-200 text-red-700 border-red-200" 
                      : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="subject" className="text-gray-300">Reason</Label>
            <input
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded-md border border-gray-700 bg-gray-900 text-white"
              placeholder="Help us understand the problem."
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Details</Label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full mt-2 p-3 rounded-md bg-gray-900 text-white border border-gray-700 resize-none"
              placeholder="Write a message"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </Button>
        </form>
      )}
    </div>
  )

  return (
    <div>
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg z-50">
          <div className="flex flex-col items-center justify-center mb-4 text-center relative">
            <h4 className="text-2xl text-white font-semibold">Send Report</h4>
            <button
              aria-label="Close report"
              onClick={onClose}
              className="absolute right-0 top-0 text-gray-200 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
          {content}
        </div>
      </div>

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
      `}</style>
    </div>
  )
}
