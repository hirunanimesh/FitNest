"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTrainerData } from '@/app/dashboard/trainer/context/TrainerContext';
import { GetMembershipGyms, GetGymProfileData } from '@/lib/api';
import GymCard from '@/components/GymCard';

export default function MembershipGyms() {
  const { trainerData } = useTrainerData();
  const router = useRouter();

  const [items, setItems] = useState<{ req: any; gym: any }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache fetched items per trainerId to avoid refetching on remount
  // Use a Map so cached results don't bleed between different trainers
  const fetchedItems = useRef<Map<string | number, { req: any; gym: any }[]> | null>(null);

  useEffect(() => {
    const fetchGyms = async () => {
      if (!trainerData) return;
      const trainerId = (trainerData as any)?.trainer_id || (trainerData as any)?.id;
      if (!trainerId) return;

      // Use cached data for this trainer if available
      if (!fetchedItems.current) fetchedItems.current = new Map();
      const cached = fetchedItems.current.get(trainerId);
      if (cached) {
        setItems(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await GetMembershipGyms(trainerId);
        const data: any[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.gyms)
          ? res.gyms
          : Array.isArray(res?.data)
          ? res.data
          : [];

        if (data.length > 0) {
          const withProfiles = await Promise.all(
            data.map(async (req: any) => {
              try {
                const gym = await GetGymProfileData(req.gym_id);
                return { req, gym };
              } catch {
                return { req, gym: null };
              }
            })
          );
          // cache results for this trainerId
          fetchedItems.current.set(trainerId, withProfiles);
          setItems(withProfiles);
        } else {
          setItems([]);
        }
      } catch (err: any) {
        console.error('GetMembershipGyms error', err);
        setError('Failed to load membership gyms.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, [trainerData]);

  if (loading)
    return <div className="py-8 text-gray-400 text-center">Loading gyms...</div>;
  if (error)
    return <div className="py-8 text-red-500 text-center">{error}</div>;
  if (!items || items.length === 0)
    return <div className="py-8 text-gray-400 text-center">No membership gyms found.</div>;

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white text-center mb-6 md:mb-10">
        Membership Gyms
      </h2>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(() => {
          const currentTrainerId = (trainerData as any)?.trainer_id || (trainerData as any)?.id || 'unknown';
          return items.map(({ req, gym }) => {
            const key = req.request_id || req.id || req.gym_id || (gym && gym.gym_id);
            const gymProp = gym || {
              gym_id: req.gym_id,
              gym_name: `${req.gym_name}`,
              // prefer gym.profile_img, fall back to request-level profile_img
              profile_img: (gym && (gym as any).profile_img) ?? req.profile_img ?? null,
              address: req.address || req.gym_address || '',
            };
            // debug: helps identify if the same image/url is being passed repeatedly
            // remove or comment out in production
            // eslint-disable-next-line no-console
            console.debug('MembershipGyms item', { trainerId: currentTrainerId, gymId: gymProp.gym_id, gymName: gymProp.gym_name, profileImg: gymProp.profile_img });
            return (
              <div key={`${currentTrainerId}-${key}`} className="group relative">
                <GymCard
                  gym={gymProp}
                  onClick={() => router.push(`/dashboard/user/gym/${req.gym_id}`)}
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
          });
        })()}
      </div>
    </div>
  );
}
