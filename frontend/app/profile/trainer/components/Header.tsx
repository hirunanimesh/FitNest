"use client";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useTrainerData } from "../context/TrainerContext";

export default function Header() {
  const { trainerData, isLoading } = useTrainerData();
  const router = useRouter();
  const trainerName = trainerData?.trainer_name || "Trainer";
  return (
    <header className="bg-gradient-to-r from-gray-800 via-gray-900 to-black/60 backdrop-blur-sm shadow sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard/user/search")}
              className="inline-flex items-center text-sm text-red-400 hover:text-red-500 font-semibold"
            >
              ← Back
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">{trainerName}</h1>
                <div className="text-xs text-gray-400">Personal Trainer</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-6">
              <a href="#about" className="text-gray-300 hover:text-red-400">
                About
              </a>
              <a href="#sessions" className="text-gray-300 hover:text-red-400">
                Sessions
              </a>
              <a href="#feedbacks" className="text-gray-300 hover:text-red-400">
                Feedbacks
              </a>
              <a href="#blog" className="text-gray-300 hover:text-red-400">
                Blog
              </a>
              <a href="#contact" className="text-gray-300 hover:text-red-400">
                Contact
              </a>
            </nav>

            <button
              onClick={() => router.push("#sessions")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-md shadow-md"
            >
              Book a Session
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}