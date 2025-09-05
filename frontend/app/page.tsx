import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FAQSection } from "@/components/faq-section"
import { ReviewsSection } from "@/components/reviews-section"
import { HeroVideoSection } from "@/components/hero-video-section"
import { CTASection } from "@/components/cta-section"
import CircularGallery from "@/components/circularGallery"
import { ScrollRevealFeaturesSection } from "@/components/scroll-reveal-section"
import { ScrollRevealStatsSection } from "@/components/scroll-reveal-stats"
import PWAInstallPrompt from "@/components/pwa-install-prompt"
import { PublicRoute } from "@/components/PublicRoute"

const galleryImages = [
  {
    image: "/images/gallery-1.png",
    text: "Modern gym equipment",
  },
  {
    image: "/images/gallery-2.png",
    text: "Group fitness class",
  },
  {
    image: "/images/gallery-3.png",
    text: "Personal training session",
  },
  {
    image: "/images/gallery-4.png",
    text: "Yoga and stretching area",
  },
  {
    image: "/images/gallery-5.png",
    text: "Cardio equipment zone",
  },
  {
    image: "/images/gallery-6.png",
    text: "Strength training area",
  },
]

export default function HomePage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Hero Section with Video Background */}
        <HeroVideoSection />

        {/* Features Section with Scroll Reveal */}
        <ScrollRevealFeaturesSection />

        {/* Stats Section with Scroll Reveal */}
        <ScrollRevealStatsSection />

        <CTASection />
        <ReviewsSection />
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-red-500">Photo Gallery</h2>
            <p className="text-center text-gray-600 mb-4 max-w-2xl mx-auto">
              Explore our world-class facilities, equipment, and the vibrant fitness community that makes FitNest special.
            </p>
            <div style={{ height: '600px', position: 'relative' }}>
              <CircularGallery 
                items={galleryImages}
                bend={3} 
                textColor="#000000" 
                borderRadius={0.05} 
                scrollEase={0.2}
              />
            </div>
          </div>
        </section>
        <FAQSection />
        {/* <Footer /> */}

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    </PublicRoute>
  )
}
