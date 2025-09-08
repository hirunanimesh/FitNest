"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Calendar, Star } from "lucide-react"
import { useTrainerData } from "../context/TrainerContext";

export default function AboutSection() {
  const { trainerData, isLoading } = useTrainerData();
  const trainerName = trainerData?.trainer_name || "Trainer";
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-800 to-black">
      <div className="container mx-auto px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4"><span className="bg-gradient-to-r from-rose-300 via-rose-400 to-pink-300 bg-clip-text text-transparent text-4xl sm:text-5xl md:text-5xl font-extrabold leading-tight drop-shadow-lg whitespace-nowrap">About {trainerName}</span>
          </h3>
            
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
      <Card className="bg-gray-800 border-indigo-700 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-6 flex items-center space-x-4">
        <Users className="w-8 h-8 text-indigo-400" />
                <div>
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-gray-400">Clients Transformed</div>
                </div>
              </CardContent>
            </Card>

      <Card className="bg-gray-800 border-teal-700 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-6 flex items-center space-x-4">
        <Calendar className="w-8 h-8 text-teal-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{trainerData?.years_of_experience ? `${trainerData.years_of_experience}+` : '8+'}</div>
                  <div className="text-sm text-gray-400">Years Experience</div>
                </div>
              </CardContent>
            </Card>

      <Card className="bg-gray-800 border-amber-700 transition-transform duration-200 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-6 flex items-center space-x-4">
        <Star className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{trainerData?.rating ? trainerData.rating.toFixed(1) : '5.0'}</div>
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