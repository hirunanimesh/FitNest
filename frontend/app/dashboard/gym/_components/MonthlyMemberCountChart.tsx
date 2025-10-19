import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGym } from '../context/GymContext';
import { GetGymPlans, GetMonthlyMembers } from '@/api/gym/route';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MonthlyMemberCountChart = () => {
  const { gymId } = useGym();
  const [monthlyMembers, setMonthlyMembers] = useState<number[]>([]);
  const [startMonth, setStartMonth] = useState("0"); // default Jan
  const [endMonth, setEndMonth] = useState("11");   // default Dec

  useEffect(() => {
    // Load from localStorage immediately (like revenue chart)
    const members = localStorage.getItem("monthlyMembers");
    if (members) {
      setMonthlyMembers(JSON.parse(members));
    } else {
      setMonthlyMembers(new Array(12).fill(0));
    }

    // Background update with API data
    const updateFromAPI = async () => {
      if (!gymId) return;
      
      try {
        const gymPlansRes = await GetGymPlans(gymId);
        const gymPlans = gymPlansRes?.data?.gymPlan || [];
        
        if (gymPlans.length > 0) {
          const mmRes = await GetMonthlyMembers(gymPlans);
          const points = mmRes?.data?.data || [];
          
          // Convert API data to simple number array
          const memberCounts = new Array(12).fill(0);
          points.forEach((point: any) => {
            const monthIndex = monthNames.indexOf(point.month);
            if (monthIndex !== -1) {
              memberCounts[monthIndex] = point.members || 0;
            }
          });
          
          // Update state and localStorage
          setMonthlyMembers(memberCounts);
          localStorage.setItem("monthlyMembers", JSON.stringify(memberCounts));
        }
      } catch (error) {
        console.error('Failed to update member data:', error);
        // Keep existing data, don't show errors
      }
    };

    updateFromAPI();
  }, [gymId]);

  // For months in the future (after current month), render as null to avoid showing zero marks
  const currentMonthIndex = new Date().getMonth();
  const chartData = monthNames.map((month, i) => ({
    month,
    members: i > currentMonthIndex ? null : (monthlyMembers[i] ?? 0),
  }));

  const filteredData = chartData.slice(Number(startMonth), Number(endMonth) + 1);

  // Download CSV function
  const downloadCSV = () => {
    const currentYear = new Date().getFullYear();
    const headers = ["Month", "Members"];
    const rows = filteredData.map((d) => [d.month, d.members ?? ""]);
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
          Monthly Member Count ({new Date().getFullYear()})
        </h2>
        <Button
          onClick={downloadCSV}
          className="text-white"
        >
          Download CSV
        </Button>
      </div>

      {/* Chart */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--card-foreground))",
              }}
              formatter={(value: number) => [`${value} members`, "Member Count"]}
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
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
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