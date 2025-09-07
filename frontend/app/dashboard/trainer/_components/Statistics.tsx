import { useTrainerData } from '../context/TrainerContext'
import StatCard from '@/components/statCard';
import { Users, CalendarCheck, Dumbbell, DollarSign, Clock } from 'lucide-react';

const Statistics: React.FC = () => {
  const { trainerData } = useTrainerData();
  // You cannot use 'export default function' here because you are using a React.FC arrow function.
  // If you want to use 'export default function', you would need to define the component as a function declaration:
  // export default function Statistics() { ... }
  // But with your current arrow function style, keep 'const Statistics: React.FC = () => { ... }'
  const analytics = [
    { title: "Total Users", value: 50, icon: Users, iconColor: "text-blue-500" },
    { title: "Total Sessions", value: trainerData?.totalSessionCount ?? 0, icon: CalendarCheck, iconColor: "text-purple-500" },
    { title: "Total Plans", value: trainerData?.plans?.length ?? 0, icon: Dumbbell, iconColor: "text-green-500" },
    { title: "Monthly Revenue", value: 100000, icon: DollarSign, iconColor: "text-yellow-500" },
    { title: "Today Schedules", value: 5, icon: Clock, iconColor: "text-orange-500" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
