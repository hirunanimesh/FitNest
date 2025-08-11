"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import VideoModal from "@/components/ui/VideoModal";
import Particles from "./particle";

export function CTASection(): JSX.Element {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const openModal = (): void => setModalOpen(true);
  const closeModal = (): void => setModalOpen(false);

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Particles Background */}
      <div className="absolute inset-0">
        <Particles
          particleColors={['E43636']}
          particleCount={500}
          particleSpread={18}
          speed={0.5}
          particleBaseSize={300}
          moveParticlesOnHover={true}
          particleHoverFactor={0.5}
          alphaParticles={true}
          disableRotation={false}
          sizeRandomness={1.5}
        />
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
          Ready to Transform Your Life?
        </h2>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
          Join over 125,000 members who have already started their fitness
          journey with FitNest. Your transformation begins today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="http://localhost:3010/auth/signup">
            <Button
              size="lg"
              className="text-base px-8 py-4 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Your Journey
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8 py-4 bg-transparent border-white text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
            onClick={openModal}
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Success Stories
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <div className="text-center backdrop-blur-sm bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
            <div className="text-2xl font-bold text-white drop-shadow-md">125K+</div>
            <div className="text-sm text-gray-300">Happy Members</div>
          </div>
          <div className="text-center backdrop-blur-sm bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
            <div className="text-2xl font-bold text-white drop-shadow-md">2.5K+</div>
            <div className="text-sm text-gray-300">Partner Gyms</div>
          </div>
          <div className="text-center backdrop-blur-sm bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
            <div className="text-2xl font-bold text-white drop-shadow-md">8.5K+</div>
            <div className="text-sm text-gray-300">Expert Trainers</div>
          </div>
          <div className="text-center backdrop-blur-sm bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
            <div className="text-2xl font-bold text-white drop-shadow-md">97%</div>
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
  );
};