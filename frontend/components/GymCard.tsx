import { Star } from "lucide-react";

export default function GymCard({ gym }: { gym: any }) {
  const images = gym.image?.split(",") || [];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-[300px]">
      <div className="grid grid-cols-2 h-36">
        {images.slice(0, 2).map((src: string, i: number) => (
          <img
            key={i}
            src={src}
            alt="Gym"
            className="object-cover w-full h-full"
          />
        ))}
      </div>
      <div className="p-3 space-y-1">
        <h2 className="font-semibold text-lg truncate">{gym.gym_name}</h2>
        <div className="text-sm text-gray-600 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{gym.rating}</span>
          <span>({gym.reviews}) · Gym</span>
        </div>
        <div className="text-green-600 text-sm font-medium">Open</div>
        <div className="text-gray-500 text-sm">Closes 9:30 PM</div>
      </div>
    </div>
  );
}
