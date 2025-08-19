//public page
"use client"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import AboutSection from "./components/AboutSection"
import SessionsSection from "./components/SessionsSection"
import TestimonialsSection from "./components/Feedback"
import BlogSection from "./components/BlogSection"
import ContactSection from "./components/ContactSection"
import { Suspense } from "react"
import Feedback from "./components/Feedback"

function TrainerPageContent() {
  console.log("TrainerPage rendered"); // Debug log

  return (
    <main className="bg-gray-900 min-h-screen text-gray-100">
      <Header />
      <HeroSection />
      <AboutSection />
      <SessionsSection />
      <Feedback />
      <BlogSection />
      <ContactSection />
    </main>
  )
}

export default function TrainerPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-900 min-h-screen text-gray-100 flex items-center justify-center">
        <div className="text-white">Loading trainer profile...</div>
      </div>
    }>
      <TrainerPageContent />
    </Suspense>
  )
}
