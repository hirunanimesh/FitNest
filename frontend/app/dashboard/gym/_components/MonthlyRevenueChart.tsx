"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

const MonthlyRevenueChart = () => {
  const [monthlyRevenues, setRevenues] = useState<number[]>([]);
  const [startMonth, setStartMonth] = useState("0"); // default Jan
  const [endMonth, setEndMonth] = useState("11");   // default Dec

  useEffect(() => {
    const revenues = localStorage.getItem("monthlyRevenues");
    if (revenues) {
      setRevenues(JSON.parse(revenues));
    } else {
      setRevenues(new Array(12).fill(0));
    }
  }, []);

  const chartData = monthNames.map((month, i) => ({
    month,
    revenue: monthlyRevenues[i] || 0,
  }));

  const filteredData = chartData.slice(Number(startMonth), Number(endMonth) + 1);

  // Download CSV function
  const downloadCSV = () => {
    const currentYear = new Date().getFullYear();
    const headers = ["Month", "Revenue"];
    const rows = filteredData.map((d) => [d.month, d.revenue]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `monthlyRevenue_${currentYear}.csv`;
    link.click();
  };

  return (
    <div className="w-full p-4 bg-[hsl(var(--card))] bg-gray-800 rounded-[var(--radius)] shadow-lg">
      {/* Header with title & CSV button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-white font-semibold text-[hsl(var(--card-foreground))]">
          Monthly Revenue (2025)
        </h2>
        <Button
          onClick={downloadCSV}
          className=" text-white"
        >
          Download CSV
        </Button>
      </div>

      {/* Chart */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--card-foreground))",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
          </BarChart>
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

export default MonthlyRevenueChart;
