"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, TrendingUp, Play } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ImageBackground from "@/components/ImageBackground"; // Updated import
import { useState } from "react";
import VideoModal from "@/components/ui/VideoModal";

export function HeroVideoSection() {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Image Background - Only for this section */}
      <div className="absolute inset-0 z-0">
        <ImageBackground />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center items-center h-full text-center text-white px-4 pt-20">
        <div className="max-w-4xl mx-auto mb-1">
          <p className="text-xs md:text-sm font-light tracking-widest mb-4 text-primary uppercase">
            FITNESS & WELLNESS
          </p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
            We see a world where
            <br />
            <span className="text-primary">everyone achieves</span>
            <br />
            their fitness goals
          </h1>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="http://localhost:3010/auth/signup">
              <Button
                size="lg"
                className="text-base px-8 py-4 bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                Start Your Journey
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
              onClick={openModal}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Success Stories
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Expert Trainers Card */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-500 group shadow-2xl">
            <CardContent className="p-5 text-center">
              <div className="flex flex-col items-center">
                {/* Icon Container */}
                <div className="mb-4 p-3 bg-primary/20 backdrop-blur-sm rounded-full group-hover:bg-primary/30 transition-all duration-300 shadow-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">
                    Expert Trainers
                  </h3>
                  <p className="text-primary font-semibold text-base">
                    8,500+ certified professionals
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Connect with certified personal trainers across multiple
                    specializations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Reach Card */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-500 group shadow-2xl">
            <CardContent className="p-5 text-center">
              <div className="flex flex-col items-center">
                {/* Icon Container */}
                <div className="mb-4 p-3 bg-primary/20 backdrop-blur-sm rounded-full group-hover:bg-primary/30 transition-all duration-300 shadow-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Global Reach</h3>
                  <p className="text-primary font-semibold text-base">
                    2,500+ partner gyms
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Premium fitness centers across 90+ markets worldwide
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Analytics Card */}
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all duration-500 group shadow-2xl">
            <CardContent className="p-5 text-center">
              <div className="flex flex-col items-center">
                {/* Icon Container */}
                <div className="mb-4 p-3 bg-primary/20 backdrop-blur-sm rounded-full group-hover:bg-primary/30 transition-all duration-300 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">
                    Smart Analytics
                  </h3>
                  <p className="text-primary font-semibold text-base">
                    AI-powered insights
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Advanced progress tracking and personalized recommendations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
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
