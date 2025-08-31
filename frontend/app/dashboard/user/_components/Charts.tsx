"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from 'lucide-react';
import axios from 'axios';
import { GetWeight } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface BMIData {
    day: string;
    bmi: number;
    date: string;
}

interface WeightData {
    day: string;
    weight: number;
    height: number;    
    date: string;
}

interface WeightForm {
    date: string;
    weight: string;
    height: string;
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
    const [bmiData, setBmiData] = useState<BMIData[]>([]);
    const [weightData, setWeightData] = useState<WeightData[]>([]);
    const { getUserProfileId } = useAuth();
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (date: Date): string => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    const [weightForm, setWeightForm] = useState<WeightForm>({
        date: formatDate(new Date()),
        weight: "",
        height: ""
    });

    // Fetch real weight data from database
    const fetchWeightData = async (customerId: number) => {
        try {

            const data = await GetWeight(customerId);
            
            if (data && data.weight && Array.isArray(data.weight)) {
                // Transform the weight data
                const transformedWeightData: WeightData[] = data.weight.map((entry: any) => {
                    // Use the user-selected date instead of created_at
                    const date = new Date(entry.date);
                    return {
                        day: formatDisplayDate(date),
                        weight: parseFloat(entry.weight),
                        height: parseFloat(entry.height),
                        date: formatDate(date)
                    };
                });

                // Sort by user-selected date in chronological order and keep last 30 entries
                const sortedWeightData = transformedWeightData
                    .sort((a: WeightData, b: WeightData) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(-30);

                setWeightData(sortedWeightData);

                // Use BMI data from database
                const bmiEntries: BMIData[] = data.weight.map((entry: any) => {
                    // Use the user-selected date instead of created_at
                    const date = new Date(entry.date);
                    // Use the BMI value from database response
                    const bmi = parseFloat(entry.BMI) || 0;
                    
                    return {
                        day: formatDisplayDate(date),
                        bmi: bmi,
                        date: formatDate(date)
                    };
                });

                // Sort by user-selected date in chronological order and keep last 30 entries
                const sortedBmiData = bmiEntries
                    .sort((a: BMIData, b: BMIData) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(-30);

                setBmiData(sortedBmiData);
            }
        } catch (error) {
            console.error("Error fetching weight data:", error);
            // Keep empty arrays if there's an error
            setWeightData([]);
            setBmiData([]);
        }
    };

    useEffect(() => {
        async function fetchUserInfo() {
            try {
                 const customerId = await getUserProfileId();
                if (customerId) {
                    //console.log("Fetching weight data for customer ID:", customerId);
                    await fetchWeightData(customerId);
                }
            } catch (error) {
                console.error("Error fetching weight data:", error);
                setWeightData([]);
                setBmiData([]);
            }
        }
        fetchUserInfo();
    }, [getUserProfileId]);

    // Fixed event handler - changed to mouse event for button clicks
    const handleWeightSubmit = async(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        /*console.log("Add Weight button clicked");
        console.log("Weight form data:", weightForm);*/
       
        const customerId = await getUserProfileId();
        const newWeight = parseFloat(weightForm.weight);
        const newHeight = parseFloat(weightForm.height);
        
        console.log("Parsed weight:", newWeight, "Parsed height:", newHeight);
        
        if (newWeight > 0 && newHeight > 0 && customerId) {
            console.log("Validation passed, sending request...");
            try {
                const requestData = {
                    height: newHeight,
                    weight: newWeight,
                    customer_id: customerId,
                    date: weightForm.date,
                    BMI: (newWeight / (newHeight * newHeight)).toFixed(2)
                };
                console.log("Request data:", requestData);
                
                await axios.post(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/user/addweight`, requestData);
                
                console.log("Weight added successfully");

                // Refresh the weight data after adding new entry
                await fetchWeightData(customerId);
                
                setWeightForm({
                    date: formatDate(new Date()),
                    weight: "",
                    height: ""
                });
                setIsWeightDialogOpen(false);
            } catch (error) {
                console.error("Error adding weight:", error);
            }
        } else {
            console.log("Validation failed:");
            console.log("- Weight valid:", newWeight > 0);
            console.log("- Height valid:", newHeight > 0);
            console.log("- Customer ID exists:", !!customerId);
        }
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
                                Body Mass Index tracking over time
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
                                    Weight tracking over time
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
                                            Record your current weight and height for tracking progress.
                                        </DialogDescription>
                                    </DialogHeader>
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
                                        <div className="space-y-2">
                                            <Label htmlFor="height">Height (m)</Label>
                                            <Input className='bg-gray-800'
                                                id="height"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="3"
                                                value={weightForm.height}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                                    setWeightForm(prev => ({ ...prev, height: e.target.value }))}
                                                placeholder="Enter height (e.g., 1.75)"
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
                                    <p className="text-xs text-gray-200">Weight Change</p>
                                    <p className="text-sm font-semibold text-green-600">
                                        {weightData.length > 1 ? 
                                            `${(weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)} kg` : '0 kg'}
                                    </p>
                                </div>
                                <div className="p-2 bg-gray-700 rounded-lg">
                                    <p className="text-xs text-gray-200">Goal Progress</p>
                                    <p className="text-sm font-semibold text-purple-600">
                                        {weightData.length > 1 && weightData[0].weight > weightData[weightData.length - 1].weight ? 
                                            '📉 Losing' : weightData.length > 1 && weightData[0].weight < weightData[weightData.length - 1].weight ? 
                                            '📈 Gaining' : '📊 Monitor'}
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
