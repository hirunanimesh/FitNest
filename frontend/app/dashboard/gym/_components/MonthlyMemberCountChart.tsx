import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGym } from '../context/GymContext';
import { GetGymPlans, GetMonthlyMembers } from '@/api/gym/route';
import { toast } from 'sonner';

type ChartPoint = { month: string; year?: number; members: number };

const MonthlyMemberCountChart = () => {
  const { gymId } = useGym();
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!gymId) return;
      setLoading(true);
      try {
        // 1) Get plans for this gym
        const gymPlansRes = await GetGymPlans(gymId);
        const gymPlans = gymPlansRes?.data?.gymPlan || [];
        if (gymPlans.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }
        // 2) Ask backend for monthly member counts derived from Stripe subscriptions
        const mmRes = await GetMonthlyMembers(gymPlans);
        const points = mmRes?.data?.data || [];
        setData(points);
      } catch (e) {
        console.error('Failed to load monthly members:', e);
        toast.error('Failed to load monthly member counts');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gymId]);

  const yearLabel = useMemo(() => {
    if (!data || data.length === 0) return '';
    const years = Array.from(new Set(data.map((d) => d.year).filter(Boolean)));
    return years.length === 1 ? ` (${years[0]})` : '';
  }, [data]);

  return (
    <div className="w-full h-[400px] p-4 bg-[hsl(var(--card))] bg-gray-800 rounded-[var(--radius)] shadow-lg">
      <h2 className="text-xl font-semibold text-white text-[hsl(var(--card-foreground))] mb-4">
        Monthly Member Count{yearLabel}
      </h2>
      {loading ? (
        <div className="w-full h-[340px] animate-pulse rounded bg-gray-700" />
      ) : data.length === 0 ? (
        <div className="w-full h-[340px] flex items-center justify-center text-gray-300">
          No member data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['auto', 'auto']} />
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
              dot={{ r: 3, fill: 'hsl(var(--chart-1))' }}
              activeDot={{ r: 5 }}
              name="Member Count"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MonthlyMemberCountChart;