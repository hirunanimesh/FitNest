import React, { useEffect, useState } from 'react';
import { Users, DollarSign, UserCheck } from 'lucide-react';
import StatCard from '../../../../components/statCard';
import { GetAllGymCustomers, GetGymCustomerIds, GetGymPlans, GetMonthlyRevenue, GetStatistics } from '@/api/gym/route';
import { useGym } from '../context/GymContext';
import { toast } from 'sonner';

// Interface for statistics data
interface Stat {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

// Interface for API response
interface StatisticsResponse {
  trainers_count: number;
}

const Statistics: React.FC = () => {
  const { gymId } = useGym();
  const {userId} = useGym()
  const [statistics, setStatistics] = useState<Stat[]>([
    { title: "Total Members", value: 0, icon: Users, iconColor: "text-blue-500" },
    { title: "Total Trainers", value: 0, icon: UserCheck, iconColor: "text-green-500" },
    { title: "Monthly Revenue", value: 0, icon: DollarSign, iconColor: "text-yellow-500" },
    { title: "Total Revenue", value: 0, icon: Users, iconColor: "text-purple-500" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await GetStatistics(gymId);
        if (response.data?.trainers_count !== undefined) {
          setStatistics((prevStats) =>
            prevStats.map((stat) =>
              stat.title === "Total Trainers"
                ? { ...stat, value: response.data.trainers_count }
                : stat
            )
          );
          console.log('Trainers count fetched:', response.data.trainers_count);
        } else {
          console.log('No trainers count received');
          toast.error('No trainers count received');
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        toast.error('Error fetching statistics');
      }
    };

    const fetchMemberCount = async () => {
      try{
        const gymPlans = await GetGymPlans(gymId);
        const customerIds = await GetGymCustomerIds(gymPlans.data.gymPlan);
        const customers = await GetAllGymCustomers(customerIds.data.customerIds);
        if (customers.data?.customers !== undefined) {
          setStatistics((prevStats) =>
            prevStats.map((stat) =>
              stat.title === "Total Members"
                ? { ...stat, value: customers.data.customers.length }
                : stat
            )
          );
      }
    }catch(error){
        console.error('Error fetching member count:', error);
        toast.error('Error fetching member count');
      }
    }

    const fetchRevenue = async() => {
      try{
        const response = await GetMonthlyRevenue(userId)
        if (response.data?.currentMonthRevenue !== undefined) {
          setStatistics((prevStats) =>
            prevStats.map((stat) =>
              stat.title === "Monthly Revenue"
                ? { ...stat, value: response.data.currentMonthRevenue }
                : stat
            )
          );
        if (response.data?.totalRevenue !== undefined) {
          setStatistics((prevStats) =>
            prevStats.map((stat) =>
              stat.title === "Total Revenue"
                ? { ...stat, value: response.data.totalRevenue }
                : stat
            )
          );
        }
          console.log('Trainers count fetched:', response.data.trainers_count);
        }else{
          console.log('No revenue data received');
          toast.error('No revenue data received');
        }
      }catch(error){
        console.error('Error fetching revenue:', error);
        toast.error('Error fetching revenue');
      }
    }
    if(userId){
      fetchRevenue()
    }
    if (gymId) {
      fetchStats();
      fetchMemberCount()
    }
  }, [gymId]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statistics.length > 0 ? (
          statistics.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-300">
            No statistics available
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;