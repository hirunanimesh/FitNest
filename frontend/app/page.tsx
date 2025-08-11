import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FAQSection } from "@/components/faq-section"
import { ReviewsSection } from "@/components/reviews-section"
import { HeroVideoSection } from "@/components/hero-video-section"
import { CTASection } from "@/components/cta-section"
import { GallerySection } from "@/components/gallery-section"
import { ScrollRevealFeaturesSection } from "@/components/scroll-reveal-section"
import { ScrollRevealStatsSection } from "@/components/scroll-reveal-stats"
import PWAInstallPrompt from "@/components/pwa-install-prompt"

export default function HomePage() {
  return (
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
      <GallerySection />
      <FAQSection />
      <Footer />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}
