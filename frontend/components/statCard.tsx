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
    <Card className="group rounded-lg bg-white/5 backdrop-blur-sm border-white/10 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl overflow-hidden relative">
      {/* gradient overlay that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-rose-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
      <CardContent className="p-6 bg-gray-800 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300 group-hover:text-red-100 transition-colors duration-300">{title}</p>
            <p className="text-2xl text-white font-bold group-hover:text-red-100 transition-colors duration-300">{value.toLocaleString()}</p>
          </div>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
