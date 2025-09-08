import React, { useEffect, useState } from 'react';
import { useTrainerData } from '../context/TrainerContext'
import StatCard from '@/components/statCard';
import { Users, CalendarCheck, Dumbbell, DollarSign, Clock, Building2 } from 'lucide-react';
import { GetMembershipGyms } from '@/lib/api';

const Statistics: React.FC = () => {
  const { trainerData } = useTrainerData();
  const [membershipCount, setMembershipCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchMemberships = async () => {
      if (!trainerData) return;
      const trainerId = (trainerData as any)?.trainer_id || (trainerData as any)?.id;
      if (!trainerId) return;
      try {
        const res = await GetMembershipGyms(trainerId);
        // normalize response: could be { gyms: [...] } or array
        let data: any[] = [];
        if (Array.isArray(res)) data = res;
        else if (Array.isArray(res?.gyms)) data = res.gyms;
        else if (Array.isArray(res?.data)) data = res.data;
        else data = [];
        setMembershipCount(data.length);
      } catch (err) {
        console.error('Failed to fetch membership gyms', err);
        setMembershipCount(0);
      }
    };

    fetchMemberships();
  }, [trainerData]);
  const analytics = [
    { title: "Total Users", value: 50, icon: Users, iconColor: "text-blue-500" },
    { title: "Monthly Revenue", value: 100000, icon: DollarSign, iconColor: "text-yellow-500" },
    { title: "Membership Gyms", value: membershipCount ?? 0, icon: Building2, iconColor: "text-gray-500" },
    { title: "Total Sessions", value: trainerData?.totalSessionCount ?? 0, icon: CalendarCheck, iconColor: "text-purple-500" },
    { title: "Total Plans", value: trainerData?.totalPlanCount ?? 0, icon: Dumbbell, iconColor: "text-green-500" },
    { title: "Today Schedules", value: 5, icon: Clock, iconColor: "text-orange-500" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-transparent">
        {analytics.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            iconColor={item.iconColor}
          />
        ))}
      </div>
    </div>
  );
};

export default Statistics;
