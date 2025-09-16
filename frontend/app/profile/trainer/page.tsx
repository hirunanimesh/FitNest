//public page
"use client"
import { useSearchParams } from "next/navigation"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import AboutSection from "./components/AboutSection"
import SessionsSection from "./components/SessionsSection"
import TestimonialsSection from "./components/Feedback"
import BlogSection from "./components/BlogSection"
import ContactSection from "./components/ContactSection"
import { Suspense } from "react"
import Feedback from "./components/Feedback"
import { TrainerDataProvider } from "./context/TrainerContext"
import TopBar from '../../dashboard/user/_components/TopBar'
import { UserDataProvider } from '../../dashboard/user/context/UserContext'

function TrainerPageContent() {
  console.log("TrainerPage rendered"); // Debug log
  const searchParams = useSearchParams()
  const isAdminView = searchParams.get('adminView') === 'true'

  return (
    <TrainerDataProvider>
      <main className="bg-gray-900 min-h-screen text-gray-100">
      <UserDataProvider>
        {!isAdminView && <TopBar />}
      </UserDataProvider>
        <HeroSection />
      
        <SessionsSection />
        <Feedback />
        <BlogSection />
        <ContactSection />
      </main>
    </TrainerDataProvider>
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
