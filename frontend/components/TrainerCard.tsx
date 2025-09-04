"use client";
import React from "react";
import { User, Star, Badge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Trainer {
  id: number;
  trainer_name: string;
  profile_img?: string | null;
  expertise: string;
  contact_no?: string | null;
  year_of_experience: number;
  rating?: number;
  bio: string;
  email: string;
  skills?: string | string[];
}

interface TrainerCardProps {
  trainer: Trainer;
}

export default function TrainerCard({ trainer }: TrainerCardProps) {
  const profileImg = trainer.profile_img || "https://images.unsplash.com/photo-1597345470829-cedbac7ef36e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
  const rating = typeof trainer.rating === 'number' && !isNaN(trainer.rating) ? trainer.rating : 4.5;

  return (
    <Link href={`/profile/trainer?id=${trainer.id}`}>
      <Card
        className="group bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/20 w-full max-w-sm mx-auto transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/70 hover:rotate-2 overflow-hidden animate-fade-in cursor-pointer"
      >
        <div className="relative">
          <div
            className="h-80 bg-cover bg-center"
            style={{ backgroundImage: `url('${profileImg}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>
        <CardContent className="relative p-6 space-y-3">
          <div className="text-center relative">
            <h3 className="text-xl font-bold text-white truncate group-hover:text-red-100 transition-colors">
              {trainer.trainer_name}
            </h3>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-500" />
          </div>
          <Badge
            className="mt-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium px-3 py-1 rounded-full"
          >
            {trainer.expertise}
          </Badge>
          <div className="flex items-center justify-between text-sm text-slate-300 group-hover:text-red-100 transition-colors">
            <span>Experience: {trainer.year_of_experience} years</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
          {trainer.contact_no && (
            <p className="text-sm text-slate-300 group-hover:text-red-100 transition-colors text-center">
              Contact: {trainer.contact_no}
            </p>
          )}
          <p className="text-sm text-slate-400 line-clamp-2 group-hover:text-red-100 transition-colors">
            {trainer.bio || "No bio available."}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}