import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType; // Icon component
  iconColor?: string; // Tailwind color classes like 'text-blue-500'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor}) => {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-6 bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">{title}</p>
            <p className="text-2xl text-white font-bold">{value.toLocaleString()}</p>
          </div>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
