'use client'
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import VideoModal from "@/components/ui/VideoModal"

export function CTASection() {
  const [isModalOpen, setModalOpen] = useState(false)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src="/images/cta-background.png" alt="Fitness motivation" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Life?</h2>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Join over 125,000 members who have already started their fitness journey with FitNest. Your transformation
          begins today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="bg-card border-border">
              <DropdownMenuItem asChild>
                <Link href="/auth/signup?type=user">User</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/signup?type=trainer">Trainer</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/signup?type=gym">Gym</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8 py-4 bg-transparent border-white text-white hover:bg-white hover:text-black"
            onClick={openModal}
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Success Stories
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">125K+</div>
            <div className="text-sm text-gray-300">Happy Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">2.5K+</div>
            <div className="text-sm text-gray-300">Partner Gyms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">8.5K+</div>
            <div className="text-sm text-gray-300">Expert Trainers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">97%</div>
            <div className="text-sm text-gray-300">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        videoUrl="https://www.youtube.com/embed/dK4AfPI6GRs"
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </section>
  )
}
