"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { GetUserInfo } from "@/lib/api"
import axios from "axios"

export default function ContactSection() {
  const [form, setForm] = useState( {message: ""} )
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null);
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    setTrainerId(id ? parseInt(id, 10) : null)

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
      } catch {
        setProfileId(null)
        setCustomerId(null)
      }
    }
    fetchUserInfo()
  }, [])

  
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Replace with your contact API or service
      await axios.post(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/user/addfeedback`, {
        user_id: customerId,
        feedback: form.message,
        trainer_id: trainerId,
        
      });
      setSubmitted(true)
      setForm({ message: "" })
    } catch {
      alert("Failed to send message. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 max-w-lg">
        <h3 className="text-3xl font-bold text-white mb-8 text-center">Send Feedback</h3>
        {submitted ? (
          <div className="bg-green-700 text-white p-6 rounded-md text-center">
            Thank you for your message! I'll get back to you shortly.
          </div>
        ) : (
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
                className="w-full mt-1 p-2 rounded-md bg-gray-800 text-white border border-gray-700"
                rows={5}
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-red-600 hover:bg-red-700">
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
