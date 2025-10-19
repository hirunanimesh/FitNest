import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGym } from '../context/GymContext';
import { GetGymPlans, GetMonthlyMembers } from '@/api/gym/route';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type ChartPoint = { month: string; year?: number; members: number };

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MonthlyMemberCountChart = () => {
  const { gymId } = useGym();
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [startMonth, setStartMonth] = useState("0"); // default Jan
  const [endMonth, setEndMonth] = useState("11");   // default Dec

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

  // Create filtered data based on month range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Create a mapping of month names to indices for filtering
    const monthToIndex = monthNames.reduce((acc, month, index) => {
      acc[month] = index;
      return acc;
    }, {} as Record<string, number>);

    return data.filter((item) => {
      const monthIndex = monthToIndex[item.month];
      const start = Number(startMonth);
      const end = Number(endMonth);
      
      if (monthIndex === undefined) return true; // Keep items with unknown months
      
      // Handle year-end wrapping (e.g., Oct-Feb range)
      if (start <= end) {
        return monthIndex >= start && monthIndex <= end;
      } else {
        return monthIndex >= start || monthIndex <= end;
      }
    });
  }, [data, startMonth, endMonth]);

  // Download CSV function
  const downloadCSV = () => {
    const currentYear = new Date().getFullYear();
    const headers = ["Month", "Members"];
    const rows = filteredData.map((d) => [d.month, d.members]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `monthlyMemberCount_${currentYear}.csv`;
    link.click();
  };

  return (
    <div className="w-full p-4 bg-[hsl(var(--card))] bg-gray-800 rounded-[var(--radius)] shadow-lg">
      {/* Header with title & CSV button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-white font-semibold text-[hsl(var(--card-foreground))]">
          Monthly Member Count{yearLabel}
        </h2>
        <Button
          onClick={downloadCSV}
          className=" text-white"
        >
          Download CSV
        </Button>
      </div>

      {/* Chart container with same height as revenue chart */}
      <div className="w-full h-[400px]">
        {loading ? (
          <div className="w-full h-full animate-pulse rounded bg-gray-700" />
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No member data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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

      {/* Filters below chart */}
      <div className="flex gap-6 mt-6 justify-center">
        {/* Start Month */}
        <div>
          <label className="text-white text-sm block mb-1">Start</label>
          <Select value={startMonth} onValueChange={setStartMonth}>
            <SelectTrigger className="w-[120px] bg-gray-700 text-white">
              <SelectValue placeholder="Select Start" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* End Month */}
        <div>
          <label className="text-white text-sm block mb-1">End</label>
          <Select value={endMonth} onValueChange={setEndMonth}>
            <SelectTrigger className="w-[120px] bg-gray-700 text-white">
              <SelectValue placeholder="Select End" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default MonthlyMemberCountChart;