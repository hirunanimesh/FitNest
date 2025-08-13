"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Calendar, Star } from "lucide-react"
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function AboutSection() {
  const [trainerName, setTrainerName] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const trainerId = searchParams.get("id"); // Get trainerId from the query string
  const router = useRouter();
  useEffect(() => {

    const fetchTrainerName = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/gettrainerbyid/${trainerId}`
        );
        if (response.data && response.data.trainer) {
          setTrainerName(response.data.trainer.trainer_name); // Assuming the API returns trainer_name
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching trainer name:", error);
      }
    };

    fetchTrainerName();
  }, [trainerId]);
  return (
    <section id="about" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">About {trainerName} </h3>
          <p className="text-lg text-gray-300">Passionate about helping people discover their strength and potential</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h4 className="text-xl font-semibold text-white mb-4">My Story</h4>
            <p className="text-gray-300 mb-6 leading-relaxed">
              With over 8 years of experience in fitness and wellness, I've dedicated my career to helping busy
              professionals reclaim their health and confidence. My approach combines evidence-based training
              methods with personalized nutrition and mindset coaching.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              I specialize in working with remote workers, executives, and parents who struggle to find time for
              fitness. My programs are designed to fit into your busy lifestyle while delivering real, sustainable
              results.
            </p>

            <div className="space-y-3">
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">NASM Certified Personal Trainer</Badge>
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">Precision Nutrition Level 1</Badge>
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">Corrective Exercise Specialist</Badge>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 flex items-center space-x-4">
                <Users className="w-8 h-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-gray-400">Clients Transformed</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 flex items-center space-x-4">
                <Calendar className="w-8 h-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-white">8+</div>
                  <div className="text-sm text-gray-400">Years Experience</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 flex items-center space-x-4">
                <Star className="w-8 h-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-white">5.0</div>
                  <div className="text-sm text-gray-400">Average Rating</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
