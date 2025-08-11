import { Star } from "lucide-react";

export default function GymCard({ gym }: { gym: any }) {
  return (
    <div className="bg-[#192024]  rounded-xl shadow-md overflow-hidden w-[300px]">
      <div className="h-36">
        {gym.profile_img ? (
          <img
            src={gym.profile_img}
            alt={`${gym.gym_name} Profile`}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-200 w-full h-full">
            <span className="text-gray-500">No Image Available</span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <h2 className="font-semibold text-lg truncate">{gym.gym_name}</h2>
        <div className="text-sm text-white-500 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{gym.rating}</span>
          <span>({gym.reviews}) · Gym</span>
        </div>
        <div className="text-green-600 text-sm font-medium">Open</div>
        <div className="text-white-500 text-sm">Closes 9:30 PM</div>
      </div>
    </div>
  );
}