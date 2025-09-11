
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTrainerData } from '@/app/dashboard/trainer/context/TrainerContext';
import { GetMembershipGyms } from '@/lib/api';
import GymCard from '@/components/GymCard';
import { GetGymDetails } from '@/api/user/route';

// Define interfaces for type safety
interface GymRequest {
  request_id?: string;
  id?: string;
  gym_id: number;
  approved?: boolean;
  requested_at?: string;
}

interface GymData {
  gym_id: number;
  gym_name: string;
  profile_img?: string | null;
  description?: string | null;
  address: string;
  location: string;
  contact_no?: string | null;
  rating?: number;
  reviews?: number;
  [key: string]: any; // Allow for additional properties
}

export default function MembershipGyms() {
  const { trainerData } = useTrainerData();
  const router = useRouter();

  const [items, setItems] = useState<{ req: GymRequest; gym: GymData | null }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache fetched items to avoid refetching on remount
  const fetchedItems = useRef<{ req: GymRequest; gym: GymData | null }[] | null>(null);

  useEffect(() => {
    const fetchGyms = async () => {
      // Keep loading until trainerData is available
      if (!trainerData) {
        return; // Stay in loading state
      }

      const trainerId = (trainerData as any)?.trainer_id || (trainerData as any)?.id;
      if (!trainerId) {
        setError('Trainer ID not found');
        setLoading(false);
        return;
      }

      // Use cached data if available
      if (fetchedItems.current) {
        setItems(fetchedItems.current);
        setLoading(false);
        return;
      }

      setError(null);

      try {
        const res = await GetMembershipGyms(trainerId);
        const data: GymRequest[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.gyms)
          ? res.gyms
          : Array.isArray(res?.data)
          ? res.data
          : [];

        if (data.length > 0) {
          const withProfiles = await Promise.all(
            data.map(async (req: GymRequest) => {
              try {
                const gymResponse = await GetGymDetails(req.gym_id);
                const gymData = gymResponse?.data?.gym || null;
                console.log('Fetched gym profile:', gymData);
                return { req, gym: gymData };
              } catch (error) {
                console.error(`Failed to fetch gym profile for gym_id ${req.gym_id}:`, error);
                return { req, gym: null };
              }
            })
          );
          fetchedItems.current = withProfiles; // Cache data
          setItems(withProfiles);
        } else {
          setItems([]);
        }
      } catch (err: any) {
        console.error('GetMembershipGyms error:', err);
        setError('Failed to load membership gyms.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, [trainerData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-500/30 rounded-full animate-spin border-t-red-500 mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-rose-500/30 rounded-full animate-spin border-t-rose-500 m-auto animate-reverse"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Loading Membership Gyms</h3>
            <p className="text-slate-400">Fetching your gyms, please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="py-8 text-red-500 text-center">{error}</div>;
  }

  if (!items || items.length === 0) {
    return <div className="py-8 text-gray-400 text-center">No membership gyms found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white text-center mb-6 md:mb-10">
        Membership Gyms
      </h2>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ req, gym }) => {
          const key = req.request_id || req.id || req.gym_id;
          const gymProp =
            gym || {
              gym_id: req.gym_id,
              gym_name: `Gym ${req.gym_id}`,
              profile_img: undefined,
              address: 'Address not available',
              location: 'Location not available',
              description: null,
              contact_no: null,
              rating: undefined,
              reviews: undefined
            };
          return (
            <div key={key} className="group relative">
              <GymCard
                gym={gymProp}
                onClick={() => router.push(`/profile/gym/${req.gym_id}`)}
              />
              <div className="absolute top-3 left-3">
                {req.approved ? (
                  <span className="px-2 py-1 rounded-full text-green-700 bg-green-100 text-xs">
                    Approved
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-yellow-700 bg-yellow-100 text-xs">
                    Pending
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 left-3 text-xs text-white/90 px-2 py-1 rounded bg-black/40">
                Requested:{' '}
                {req.requested_at ? new Date(req.requested_at).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          );
        })}
      </div>
      <style jsx global>{`
        @keyframes reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-reverse {
          animation: reverse 2s linear infinite;
        }
      `}</style>
    </div>
  );
}


