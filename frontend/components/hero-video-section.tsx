"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, TrendingUp, Play } from "lucide-react";
import Link from "next/link";
import ImageBackground from "@/components/ImageBackground";
import { useState } from "react";
import VideoModal from "@/components/ui/VideoModal";

export function HeroVideoSection() {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Image Background - Only for this section */}
      <div className="absolute inset-0 z-0">
        <ImageBackground />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center items-center min-h-screen text-center text-white px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm font-light tracking-widest mb-4 sm:mb-6 text-primary uppercase">
            FITNESS & WELLNESS
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 sm:mb-8 px-2">
            We see a world where
            <br />
            <span className="text-primary">everyone achieves</span>
            <br />
            their fitness goals
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-12 px-4 sm:px-0">
            <Link href="https://fit-nest.app/auth/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                Start Your Journey
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
              onClick={openModal}
            >
              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Watch Success Stories
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto w-full px-2 sm:px-4">
          {/* Expert Trainers Card */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-500 group shadow-2xl">
            <CardContent className="p-4 sm:p-5 text-center">
              <div className="flex flex-col items-center">
                {/* Icon Container */}
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-primary/20 backdrop-blur-sm rounded-full group-hover:bg-primary/30 transition-all duration-300 shadow-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Expert Trainers
                  </h3>
                  <p className="text-primary font-semibold text-sm sm:text-base">
                    8,500+ certified professionals
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    Connect with certified personal trainers across multiple
                    specializations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Reach Card */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-500 group shadow-2xl">
            <CardContent className="p-4 sm:p-5 text-center">
              <div className="flex flex-col items-center">
                {/* Icon Container */}
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-primary/20 backdrop-blur-sm rounded-full group-hover:bg-primary/30 transition-all duration-300 shadow-lg">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">Global Reach</h3>
                  <p className="text-primary font-semibold text-sm sm:text-base">
                    2,500+ partner gyms
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    Premium fitness centers across 90+ markets worldwide
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Analytics Card */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-500 group shadow-2xl sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-5 text-center">
              <div className="flex flex-col items-center">
                {/* Icon Container */}
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-primary/20 backdrop-blur-sm rounded-full group-hover:bg-primary/30 transition-all duration-300 shadow-lg">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Smart Analytics
                  </h3>
                  <p className="text-primary font-semibold text-sm sm:text-base">
                    AI-powered insights
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    Advanced progress tracking and personalized recommendations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="animate-bounce">
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-1 sm:mt-2 animate-pulse"></div>
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
}