"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTrainerData } from '@/app/dashboard/trainer/context/TrainerContext';
import { GetMembershipGyms, GetGymProfileData } from '@/lib/api';
import GymCard from '@/components/GymCard';

export default function MembershipGyms() {
  const { trainerData } = useTrainerData();
  const router = useRouter();
  const [requests, setRequests] = useState<any[] | null>(null);
  const [items, setItems] = useState<any[] | null>(null); // { req, gym }
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGyms = async () => {
      if (!trainerData) return;
      const trainerId = (trainerData as any)?.trainer_id || (trainerData as any)?.id;
      if (!trainerId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await GetMembershipGyms(trainerId);
        console.debug('GetMembershipGyms response', res);
        let data: any[] = [];
        if (Array.isArray(res)) data = res;
        else if (Array.isArray(res?.gyms)) data = res.gyms;
        else if (Array.isArray(res?.data)) data = res.data;
        else data = [];

        setRequests(data);

        if (data.length > 0) {
          // fetch gym profiles in parallel
          const withProfiles = await Promise.all(
            data.map(async (req: any) => {
              try {
                const gym = await GetGymProfileData(req.gym_id);
                return { req, gym };
              } catch (err) {
                console.debug('failed to fetch gym profile for', req.gym_id, err);
                return { req, gym: null };
              }
            })
          );
          setItems(withProfiles);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('GetMembershipGyms error', err);
        const message = (err as any)?.message || String(err) || 'Failed to load gyms';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, [trainerData]);

  if (loading) return <div className="py-8">Loading membership gyms...</div>;
  if (error) return <div className="py-8 text-red-500">{error}</div>;
  if (!Array.isArray(items) || items.length === 0) return <div className="py-8">No membership gyms found.</div>;

  return (
    <div>
      <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-10">
        <span className="bg-gradient-to-r from-black-600 via-rose-400 to-black-600 bg-clip-text text-transparent">
          Membership Gyms
        </span>
      </h2>
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(({ req, gym }: any) => {
        const key = req.request_id || req.id || req.gym_id;
        const gymProp = gym || { gym_id: req.gym_id, gym_name: `Gym ${req.gym_id}`, profile_img: undefined };
        return (
          <div key={key} className="group relative">
            <GymCard gym={gymProp} onClick={() => router.push(`/dashboard/user/gym/${req.gym_id}`)} />
            <div className="absolute top-3 left-3">
              {req.approved ? (
                <span className="px-2 py-1 rounded-full text-green-700 bg-green-100 text-xs">Approved</span>
              ) : (
                <span className="px-2 py-1 rounded-full text-yellow-700 bg-yellow-100 text-xs">Pending</span>
              )}
            </div>
            <div className="absolute bottom-3 left-3 text-xs text-white/90 px-2 py-1 rounded bg-black/40">
              Requested: {new Date(req.requested_at).toLocaleDateString()}
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}
