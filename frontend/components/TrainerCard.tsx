import React from "react"

interface Trainer {
  trainer_id: number;
  trainer_name: string;
  profile_img?: string | null;
  expertise: string;
  contact_no?: string | null;
}

interface TrainerCardProps {
  trainer: Trainer;
}

const TrainerCard: React.FC<TrainerCardProps> = ({ trainer }) => (
  <div className="border rounded-lg p-4 shadow-md bg-white">
    <img
      src={trainer.profile_img || "/default-profile.png"}
      alt={trainer.trainer_name}
      className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
    />
    <h2 className="text-lg font-semibold text-center">{trainer.trainer_name}</h2>
    <p className="text-center text-gray-600">{trainer.expertise}</p>
    {trainer.contact_no && (
      <p className="text-center text-gray-500 text-sm mt-2">Contact: {trainer.contact_no}</p>
    )}
  </div>
);

export default TrainerCard;