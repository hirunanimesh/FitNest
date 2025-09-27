"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useTrainerData } from "../context/TrainerContext";
import { SendFeedback } from "@/lib/api"

type Props = {
  show?: boolean
  onClose?: () => void
  trainerId?: string | number | null
  customerId?: string | null
}

export default function FeedbackModel({ show, onClose, trainerId: propTrainerId, customerId: customerIdProp }: Props) {
  const [form, setForm] = useState({ message: "" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [trainerId, setTrainerId] = useState<number | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const { refreshTrainerData } = useTrainerData()

  useEffect(() => {
    // If trainerId passed as prop, use it; otherwise try to parse from URL (legacy behavior)
    if (propTrainerId) {
      const id = typeof propTrainerId === "string" ? parseInt(propTrainerId, 10) : propTrainerId
      setTrainerId(id ?? null)
    } else {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("id")
      setTrainerId(id ? parseInt(id, 10) : null)
    }

    // Use customerId supplied by parent (ContactSection). If not provided, customerId will remain null.
    if (customerIdProp) {
      setCustomerId(customerIdProp)
    }
  }, [propTrainerId, customerIdProp])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // prefer centralized API helper
      await SendFeedback(trainerId, customerId, form.message)

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
        <div className="bg-green-700 text-white p-6 rounded-md text-center">Thank you for your message! I'll get back to you shortly.</div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="message" className="text-gray-300">Message</Label>
              <textarea
                name="message"
                id="message"
                value={form.message}
                onChange={handleChange}
                required
                placeholder="Write your message here..."
                className="w-full mt-1 p-3 rounded-md bg-gray-900 text-white border border-gray-700 resize-none"
                rows={5}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-red-600 hover:bg-red-700">
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      )}
    </div>
  )

  if (isModal) {
    return (
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60" onClick={onClose} />

        <div className="relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg z-10">
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-2xl text-white font-semibold">Send Feedback</h4>
            <button aria-label="Close feedback" onClick={onClose} className="text-gray-400 hover:text-white">\u2715</button>
          </div>

          {content}
        </div>
      </div>
    )
  }

  // legacy / non-modal rendering as a section
  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-gray-800 to-black">
      <div className="container mx-auto px-4">{content}</div>
    </section>
  )
}