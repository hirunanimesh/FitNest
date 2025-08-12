"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Replace with your contact API or service
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitted(true)
      setForm({ name: "", email: "", message: "" })
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
              <Label htmlFor="name" className="text-gray-300">Name</Label>
              <Input
                type="text"
                name="name"
                id="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your Name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="mt-1"
              />
            </div>

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
