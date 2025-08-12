import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dummy data for monthly revenues (in thousands)
const data = [
  { month: 'Jan', product: 4000 },
  { month: 'Feb', product: 3000 },
  { month: 'Mar', product: 2000 },
  { month: 'Apr', product: 2780 },
  { month: 'May', product: 1890 },
  { month: 'Jun', product: 2390 },
  { month: 'Jul', product: 3490 },
  { month: 'Aug', product: 2000 },
  { month: 'Sep', product: 2780 },
  { month: 'Oct', product: 1890 },
  { month: 'Nov', product: 2390 },
  { month: 'Dec', product: 3490 },
];

const MonthlyRevenueChart = () => {
  return (
    <div className="w-full h-[400px] p-4 bg-[hsl(var(--card))] bg-gray-800 rounded-[var(--radius)] shadow-lg">
      <h2 className="text-xl text-white font-semibold text-[hsl(var(--card-foreground))] mb-4">
        Monthly Revenue (2025)
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              color: 'hsl(var(--card-foreground))',
            }}
            formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          <Legend />
          <Bar
            dataKey="product"
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
            name="Product Revenue"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyRevenueChart;