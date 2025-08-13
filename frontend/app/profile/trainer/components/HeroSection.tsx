"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import {  useSearchParams } from "next/navigation";
import { Star } from "lucide-react";

export default function HeroSection() {
  const [trainerImgUrl, setTrainerImgUrl] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const trainerId = searchParams.get("id"); // Make sure this matches your URL param
  useEffect(() => {

    const fetchTrainerImgUrl = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/gettrainerbyid/${trainerId}`
        );
        if (response.data?.trainer) {
          setTrainerImgUrl(response.data.trainer.profile_img || null);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching trainer image URL:", error);
      }
    };

    fetchTrainerImgUrl();
  }, [trainerId]);

  return (
    <section className="bg-gradient-to-br from-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <Badge className="mb-4 bg-red-100 text-red-800">Certified Personal Trainer</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Transform Your Body, Transform Your Life
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Helping busy professionals achieve their fitness goals through personalized training,
            nutrition coaching, and mindset transformation.
          </p>
        </div>
        <div className="relative">
          <img
            src={trainerImgUrl || "/images/default-trainer.jpg"} // fallback image
            alt="Trainer"
            className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
          />
          <div className="absolute -bottom-6 -left-6 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">5.0 (127 reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
