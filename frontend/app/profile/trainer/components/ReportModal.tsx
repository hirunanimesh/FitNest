"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { AddReport } from "@/lib/api"

type Props = {
  show: boolean
  onClose: () => void
  trainerId?: string | null
  customerId?: string | null
}

export default function ReportModal({ show, onClose, trainerId, customerId }: Props) {
  const [form, setForm] = useState({ report_type: "", subject: "", description: "" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
      // use centralized API helper
      await AddReport(customerId ?? null, trainerId ?? null, {
        target_type: "Trainer",
        report_type: form.report_type,
        subject: form.subject,
        description: form.description,
      })
      setSubmitted(true)
      // keep modal open and show the thank-you card overlay
    } catch (err) {
      alert("Failed to send report. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-lg z-50">
        <div className="mb-4 text-center relative">
          <h4 className="text-2xl text-gray-900 dark:text-white font-semibold">Report</h4>
          <button aria-label="Close report form" onClick={onClose} className="absolute right-0 top-0 text-gray-800 dark:text-gray-200 p-2">✕</button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-gray-700 dark:text-gray-300">Why are you reporting this Trainer?</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your report is anonymous. Reports are kept confidential and help us maintain a safe and respectful community.</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Harassment",
                  "Spam",
                  "Fraud",
                  "Inappropriate Content",
                  "Something Else",
                ].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    aria-pressed={form.report_type === t}
                    className={`px-3 py-1 rounded-full border transition-colors duration-150  
                      ${form.report_type === t ? 'bg-red-200 text-red-700 border-red-200 ' : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="subject" className="text-gray-700 dark:text-gray-300">Reason</Label>
              <input id="subject" name="subject" value={form.subject} onChange={handleChange} className="w-full mt-2 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Help us understand the problem." />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Details</Label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={5} className="w-full mt-2 p-3 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 resize-none" placeholder="Write a message" />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded">{submitting ? 'Submitting...' : 'Submit report'}</button>
              <Button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700">Cancel</Button>
            </div>
          </form>
        ) : (
          // Thank-you centered card overlay (matches the provided image)
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-xl text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 002 0V7zm-1 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Thank you for submitting a report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">We take reports seriously and after a thorough review, our support team will get back to you.</p>
              
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
