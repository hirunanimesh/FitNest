"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from 'lucide-react';

import { supabase } from "@/lib/supabase";
import axios from 'axios';
import {  GetUserInfo } from "@/lib/api"

interface BMIData {
    day: string;
    bmi: number;
    date: string;
}

interface WeightData {
    day: string;
    weight: number;
    date: string;
}

interface WeightForm {
    date: string;
    weight: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        dataKey: string;
        value: number;
        color: string;
    }>;
    label?: string;
}

const Charts: React.FC = () => {
    const [isWeightDialogOpen, setIsWeightDialogOpen] = useState<boolean>(false);
    const [profileId, setProfileId] = useState<string | null>(null);
    const [customerId, setCustomerId] = useState<string | null>(null);

useEffect(() => {
  async function fetchUserInfo() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    try {
      const data = await GetUserInfo(token);
      const profileId = data?.user?.id || null;
      setProfileId(profileId);

      if (profileId) {
        // Fetch customer_id from customer table
        const { data: customerData, error } = await supabase
          .from("customer")
          .select("id")
          .eq("user_id", profileId)
          .single();

        if (error) {
          console.error("Error fetching customer id:", error);
          setCustomerId(null);
        } else {
          setCustomerId(customerData?.id);
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setProfileId(null);
      setCustomerId(null);
    }
  }

  fetchUserInfo();
}, []);

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (date: Date): string => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    const [weightForm, setWeightForm] = useState<WeightForm>({
        date: formatDate(new Date()),
        weight: ""
    });

    // Generate dummy BMI data for the last 30 days
    const generateBMIData = (): BMIData[] => {
        const data: BMIData[] = [];
        const baseDate = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - i);
            
            // Generate realistic BMI values with some variation (22-26 range)
            const baseBMI = 24;
            const variation = (Math.sin(i * 0.2) + Math.random() * 0.5 - 0.25) * 2;
            const bmi = Math.round((baseBMI + variation) * 10) / 10;
            
            data.push({
                day: formatDisplayDate(date),
                bmi: bmi,
                date: formatDate(date)
            });
        }
        return data;
    };

    // Generate dummy weight data for the last 30 days
    const generateWeightData = (): WeightData[] => {
        const data: WeightData[] = [];
        const baseDate = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() - i);
            
            // Generate realistic weight values with gradual decrease (70-75 kg range)
            const baseWeight = 72;
            const trend = -i * 0.05; // Gradual weight loss trend
            const variation = Math.sin(i * 0.3) * 0.5 + (Math.random() * 0.8 - 0.4);
            const weight = Math.round((baseWeight + trend + variation) * 10) / 10;
            
            data.push({
                day: formatDisplayDate(date),
                weight: Math.max(weight, 68), // Minimum weight constraint
                date: formatDate(date)
            });
        }
        return data;
    };

    const [bmiData, setBmiData] = useState<BMIData[]>(generateBMIData());
    const [weightData, setWeightData] = useState<WeightData[]>(generateWeightData());

    // Fixed event handler - changed to mouse event for button clicks
    const handleWeightSubmit = async(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        const newWeight = parseFloat(weightForm.weight);
        if (newWeight > 0) {
            const newEntry: WeightData = {
                day: formatDisplayDate(new Date(weightForm.date)),
                weight: newWeight,
                date: weightForm.date
            };
            await axios.post(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/user/addweight`,{
                height: 1.75, // Example height, adjust as needed
                weight: newWeight,
                customer_id: customerId,
                
                
                date: weightForm.date,
                
            });
            // Add new entry and keep only last 30 entries
            setWeightData(prev => {
                const updated = [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                return updated.slice(-30);
            });

            // Calculate BMI (assuming height of 1.75m for demo)
            const height = 1.75;
            const bmi = Math.round((newWeight / (height * height)) * 10) / 10;
            const newBMIEntry: BMIData = {
                day: formatDisplayDate(new Date(weightForm.date)),
                bmi: bmi,
                date: weightForm.date
            };
            
            setBmiData(prev => {
                const updated = [...prev, newBMIEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                return updated.slice(-30);
            });
        }
        
        setWeightForm({
            date: formatDate(new Date()),
            weight: ""
        });
        setIsWeightDialogOpen(false);
    };

    // Custom tooltip for better data display
    const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{`Date: ${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-blue-600">
                            {`${entry.dataKey === 'bmi' ? 'BMI' : 'Weight'}: ${entry.value}${entry.dataKey === 'weight' ? ' kg' : ''}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <section id="Health Analytics" className="min-h-screen bg-black p-4">
                
                <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Health Analytics</h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">Track your BMI and weight progress over time</p>
        </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-black px-8">
                    {/* BMI Chart */}
                    <Card className='bg-[#192024]'>
                        <CardHeader >
                            <CardTitle className="flex items-center gap-2 text-white">
                                <div className="w-3 h-3 bg-red-500 rounded-full "></div>
                                BMI Variation
                            </CardTitle>
                            <CardDescription className='text-white mb-4'>
                                Body Mass Index tracking over the last 30 days
                                <br />
                                <span className="text-xs text-gray-500">
                                    Current: {bmiData.length > 0 ? bmiData[bmiData.length - 1].bmi : 'N/A'} BMI
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={bmiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="day" 
                                        tick={{ fontSize: 12 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis 
                                        domain={["dataMin - 0.5", "dataMax + 0.5"]} 
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="bmi" 
                                        stroke="#ef4444" 
                                        strokeWidth={3}
                                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#dc2626', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                <div className="p-2 bg-gray-700 rounded-lg">
                                    <p className="text-xs text-gray-200">Average BMI</p>
                                    <p className="text-sm font-semibold text-red-600">
                                        {bmiData.length > 0 ? (bmiData.reduce((sum, d) => sum + d.bmi, 0) / bmiData.length).toFixed(1) : '0'}
                                    </p>
                                </div>
                                <div className="p-2 bg-gray-700 rounded-lg">
                                    <p className="text-xs text-gray-200">Min BMI</p>
                                    <p className="text-sm font-semibold text-green-600">
                                        {bmiData.length > 0 ? Math.min(...bmiData.map(d => d.bmi)).toFixed(1) : '0'}
                                    </p>
                                </div>
                                <div className="p-2 bg-gray-700 rounded-lg">
                                    <p className="text-xs text-gray-200">Max BMI</p>
                                    <p className="text-sm font-semibold text-orange-600">
                                        {bmiData.length > 0 ? Math.max(...bmiData.map(d => d.bmi)).toFixed(1) : '0'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weight Chart */}
                    <Card className='bg-[#192024]'>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full "></div>
                                    Weight Variation
                                </CardTitle>
                                <CardDescription className='text-white'>
                                    Weight tracking over the last 30 days
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        Current: {weightData.length > 0 ? weightData[weightData.length - 1].weight : 'N/A'} kg
                                    </span>
                                </CardDescription>
                            </div>
                            <Dialog open={isWeightDialogOpen} onOpenChange={setIsWeightDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm"  className="shrink-0 bg-red-500">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Weight
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] bg-gray-900 text-gray-200">
                                    <DialogHeader>
                                        <DialogTitle>Add Weight Entry</DialogTitle>
                                        <DialogDescription>
                                            Record your current weight for tracking progress.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {/* Fixed: Removed onSubmit from div, as divs don't have form submission */}
                                    <div className="grid gap-4 py-4 ">
                                        <div className="space-y-2 ">
                                            <Label htmlFor="weight_date ">Date</Label>
                                            <Input className='bg-gray-800'
                                                id="weight_date"
                                                type="date"
                                                value={weightForm.date}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                                    setWeightForm(prev => ({ ...prev, date: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="weight">Weight (kg)</Label>
                                            <Input className='bg-gray-800'
                                                id="weight"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="300"
                                                value={weightForm.weight}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                                    setWeightForm(prev => ({ ...prev, weight: e.target.value }))}
                                                placeholder="Enter weight (e.g., 70.5)"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className='bg-gray-800'
                                            onClick={() => setIsWeightDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="button" 
                                            onClick={handleWeightSubmit}
                                        >
                                            Add Weight
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={weightData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="day" 
                                        tick={{ fontSize: 12 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis 
                                        domain={["dataMin - 1", "dataMax + 1"]} 
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="weight" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#1e40af', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                <div className="p-2 bg-gray-700 rounded-lg">
                                    <p className="text-xs text-gray-200">Average Weight</p>
                                    <p className="text-sm font-semibold text-blue-600">
                                        {weightData.length > 0 ? (weightData.reduce((sum, d) => sum + d.weight, 0) / weightData.length).toFixed(1) : '0'} kg
                                    </p>
                                </div>
                                <div className="p-2 bg-gray-700 rounded-lg">
                                    <p className="text-xs text-gray-200">Weight Loss</p>
                                    <p className="text-sm font-semibold text-green-600">
                                        {weightData.length > 1 ? 
                                            `${(weightData[0].weight - weightData[weightData.length - 1].weight).toFixed(1)} kg` : '0 kg'}
                                    </p>
                                </div>
                                <div className="p-2 bg-gray-700 rounded-lg">
                                    <p className="text-xs text-gray-200">Goal Progress</p>
                                    <p className="text-sm font-semibold text-purple-600">
                                        {weightData.length > 1 && weightData[0].weight > weightData[weightData.length - 1].weight ? 
                                            '📉 On Track' : '📊 Monitor'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                
            </section>
        
    );
};

export default Charts;