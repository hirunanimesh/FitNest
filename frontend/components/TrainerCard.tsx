import React from "react";
import { Star } from "lucide-react";

interface Trainer {
  trainer_id: number;
  trainer_name: string;
  profile_img?: string | null;
  expertise: string;
  contact_no?: string | null;
  year_of_experience: number;
  rating: number;
  skills: string[];
  bio: string;
}

interface TrainerCardProps {
  trainer: Trainer;
}

const TrainerCard: React.FC<TrainerCardProps> = ({ trainer }) => (
  <div className="border rounded-lg shadow-md bg-[#192024] w-80 h-auto  flex flex-col items-center text-center pb-4">
    {/* Trainer Image */}
    <img
      src={trainer.profile_img || "/default-profile.png"}
      alt={trainer.trainer_name}
      className="w-80 h-auto "
    />

    {/* Trainer Name */}
    <h2 className="text-lg font-semibold text-white">{trainer.trainer_name}</h2>

    {/* Expertise */}
    <p className="text-gray-400 text-sm mb-2">{trainer.expertise}</p>

    {/* Contact Number */}
    {trainer.contact_no && (
      <p className="text-gray-500 text-sm mb-2">Contact: {trainer.contact_no}</p>
    )}

    {/* Experience */}
    <p className="text-gray-400 text-sm mb-2">
      Experience: {trainer.year_of_experience} years
    </p>

    {/* Rating */}
    <div className="flex items-center justify-center text-yellow-500 mb-2">
      <Star className="w-4 h-4" />
      <span className="ml-1">{trainer.rating}</span>
    </div>

    {/* Skills */}
    <div className="text-gray-400 text-sm mb-4">
      <strong>Skills:</strong>{" "}
      {Array.isArray(trainer.skills) && trainer.skills.length > 0
        ? trainer.skills.join(", ")
        : "No skills provided"}
    </div>

    {/* Bio */}
    <p className="text-gray-400 text-sm">{trainer.bio}</p>
  </div>
);


export default TrainerCard;