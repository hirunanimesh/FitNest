import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dummy data for monthly member counts
const data = [
  { month: 'Jan', members: 150 },
  { month: 'Feb', members: 160 },
  { month: 'Mar', members: 170 },
  { month: 'Apr', members: 180 },
  { month: 'May', members: 200 },
  { month: 'Jun', members: 220 },
  { month: 'Jul', members: 240 },
  { month: 'Aug', members: 250 },
  { month: 'Sep', members: 230 },
  { month: 'Oct', members: 210 },
  { month: 'Nov', members: 190 },
  { month: 'Dec', members: 180 },
];

const MonthlyMemberCountChart = () => {
  return (
    <div className="w-full h-[400px] p-4 bg-[hsl(var(--card))] bg-gray-800 rounded-[var(--radius)] shadow-lg">
      <h2 className="text-xl font-semibold text-white text-[hsl(var(--card-foreground))] mb-4">
        Monthly Member Count (2025)
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              color: 'hsl(var(--card-foreground))',
            }}
            formatter={(value) => [`${value} members`, 'Member Count']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="members"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ r: 4, fill: 'hsl(var(--chart-1))' }}
            activeDot={{ r: 6 }}
            name="Member Count"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyMemberCountChart;