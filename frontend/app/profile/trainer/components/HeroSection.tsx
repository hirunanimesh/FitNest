"use client"
import { Badge } from "@/components/ui/badge";
import { useTrainerData } from "../context/TrainerContext";


export default function HeroSection() {
  const { trainerData, isLoading } = useTrainerData();
  const trainerImgUrl = trainerData?.profile_img || null;
  // Normalize skills (string or array) into string[]
  const skills: string[] = (() => {
    const raw = trainerData?.skills;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String).map(s => s.trim()).filter(Boolean);
    const asString = String(raw).trim();
    // Try JSON parse (handles '["a","b"]' or similar)
    try {
      const parsed = JSON.parse(asString);
      if (Array.isArray(parsed)) return parsed.map(String).map(s => s.trim()).filter(Boolean);
    } catch (e) {
      // ignore
    }
    // Fallback: remove surrounding brackets/quotes then split on commas, strip quotes
    return asString
      .replace(/^\[|\]$/g, "")
      .split(',')
      .map(s => s.replace(/^\s*["']?|["']?\s*$/g, '').trim())
      .filter(Boolean);
  })();
  return (
    <section className="relative bg-gradient-to-br from-gray-800 to-black py-11 overflow-hidden">
      {/* Decorative SVG background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-30"
        aria-hidden={true}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 600"
      >
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          <filter id="noise" x="0" y="0" width="100%" height="100%">
            <feTurbulence baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend mode="overlay" />
          </filter>
        </defs>
        <g fill="url(#g)">
          <rect width="1200" height="600" />
        </g>
        <g filter="url(#noise)" opacity="0.05">
          <rect width="1200" height="600" fill="#fff" />
        </g>
        <g opacity="0.06" transform="translate(-100, -50)">
          <path fill="#111827" d="M0,200 C150,100 300,300 450,200 C600,100 750,300 900,200 C1050,100 1200,300 1350,200 L1350,600 L0,600 Z" />
        </g>
      </svg>
      <div className="container mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          
          <h2 className="bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent text-5xl font-extrabold mb-6 md:text-5xl transform transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105 mt-0">
            Transform Your Body.</h2>
            <span className="bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent text-5xl font-extrabold  transform transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105"> Build Strength.</span>
          
            <p className="mt-8 text-lg text-gray-300 mb-8 max-w-xl ">
              {trainerData?.bio
                ? trainerData.bio
                : "Personalized training plans, nutrition coaching, and sustainable strategies to reach your best self. Training that fits your schedule and lifestyle."}
            </p>

          <div className="flex items-center space-x-4">
            <a href="#sessions" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow">Book a Session</a>
            <a
              href="#contact"
              className="bg-gray-600 inline-block text-sm text-gray-300 hover:text-white py-3 px-4 rounded-lg shadow border border-gray-600 hover:border-red-400 transition-colors hover:bg-red-600"
            >
              Send Message
            </a>
          </div>
<div className="mt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto justify-items-center"></div>
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm ">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 rounded-lg text-center transition-transform duration-300 hover:scale-110 hover:bg-gray-700">
                <div className="text-2xl font-bold text-white">{trainerData?.sessions?.length ? `${trainerData.sessions.length}+` : '500+'}</div>
                <div className="text-xs text-gray-400">Clients</div>
              </div>
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-4 rounded-lg text-center transition-transform duration-300 hover:scale-110 hover:bg-gray-700">
                <div className="text-2xl font-bold text-white">{trainerData?.years_of_experience ? `${trainerData.years_of_experience}+` : '8+'}</div>
                <div className="text-xs text-gray-400">Years</div>
              </div>
              {/*<div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-4 rounded-lg text-center transition-transform duration-300 hover:scale-110 hover:bg-gray-700">
                <div className="text-2xl font-bold text-white">{trainerData?.rating ? trainerData.rating.toFixed(1) : '5.0'}</div>
                <div className="text-xs text-gray-400">Rating</div>
              </div>*/}
            </div>

            {/* Skills badges */}
            <div className="mt-10">
              <h2 className="text-3xl font-extrabold text-gray-400 mb-2 text-center">Skills & Expertise</h2>
              <div className="flex flex-row items-center gap-3  whitespace-nowrap no-scrollbar ">
                {skills.length ? skills.map((s, i) => (
                  <Badge 
                    key={i} 
                    className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-200 text-xl font-semibold px-6 py-3 rounded-lg w-full transition-transform duration-300 hover:scale-110 hover:bg-gray-700 whitespace-nowrap items-center justify-center"
                  >
                    {s}
                  </Badge>
                )) : (
                  <span className="text-gray-400">No skills listed</span>
                )}
              </div>
            </div>

        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-700 transform hover:scale-102 transition-transform duration-300 mt-0">
            <img
              src={trainerImgUrl || "/images/default-trainer.jpg"}
              alt="Trainer"
              className="w-full h-full
               object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
