"use client";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useTrainerData } from "../context/TrainerContext";

export default function Header() {
  const { trainerData, isLoading } = useTrainerData();
  const router = useRouter();
  const trainerName = trainerData?.trainer_name || "Trainer";
  return (
    <header className="bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
         <button
          onClick={() => router.push("/dashboard/user/search")} // Navigate to the search page
          className="mb-8 text-red-400 hover:text-red-600 font-semibold flex items-center"
        >
          ← Back
        </button>
        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-3">
           
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              {trainerName} 
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
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
        </div>
      </div>
    </header>
  );
}