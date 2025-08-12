//public page
"use client"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import AboutSection from "./components/AboutSection"
import SessionsSection from "./components/SessionsSection"
import TestimonialsSection from "./components/TestimonialsSection"
import BlogSection from "./components/BlogSection"
import ContactSection from "./components/ContactSection"

export default function TrainerPage() {
  console.log("TrainerPage rendered"); // Debug log

  return (
    <main className="bg-gray-900 min-h-screen text-gray-100">
      <Header />
      <HeroSection />
      <AboutSection />
      <SessionsSection />
      <TestimonialsSection />
      <BlogSection />
      <ContactSection />
    </main>
  )
}
