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
import { useAuth } from '@/contexts/AuthContext'
import { useUserData } from '../context/UserContext'

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
    const { userData, refreshUserData } = useUserData();
    
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

    // Transform weight data from UserContext
    const processWeightData = () => {
        console.log("Charts: Processing weight data...");
        console.log("Charts: userData.weightHistory:", userData?.weightHistory);
        
        if (userData?.weightHistory && Array.isArray(userData.weightHistory)) {
            console.log("Charts: Weight history is array with length:", userData.weightHistory.length);
            
            // Transform the weight data
            const transformedWeightData: WeightData[] = userData.weightHistory.map((entry: any) => {
                console.log("Charts: Processing entry:", entry);
                // Use the user-selected date instead of created_at
                const date = new Date(entry.date);
                return {
                    day: formatDisplayDate(date),
                    weight: parseFloat(entry.weight),
                    height: parseFloat(entry.height),
                    date: formatDate(date)
                };
            });

            console.log("Charts: Transformed weight data:", transformedWeightData);

            // Sort by user-selected date in chronological order and keep last 30 entries
            const sortedWeightData = transformedWeightData
                .sort((a: WeightData, b: WeightData) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(-30);

            console.log("Charts: Sorted weight data:", sortedWeightData);
            setWeightData(sortedWeightData);

            // Use BMI data from database
            const bmiEntries: BMIData[] = userData.weightHistory.map((entry: any) => {
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

            console.log("Charts: Sorted BMI data:", sortedBmiData);
            setBmiData(sortedBmiData);
        } else {
            console.log("Charts: No weight history data or not an array");
        }
    };

    // Process weight data when userData changes
    useEffect(() => {
        console.log("Charts: UserData changed:", userData);
        console.log("Charts: WeightHistory:", userData?.weightHistory);
        if (userData?.weightHistory) {
            processWeightData();
        }
    }, [userData?.weightHistory]);

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
                    BMI: (newWeight / (newHeight * newHeight*0.0001)).toFixed(2)
                };
                console.log("Request data:", requestData);
                
                await axios.post(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/user/addweight`, requestData);
                
                console.log("Weight added successfully");

                // Refresh the weight data from UserContext after adding new entry
                await refreshUserData();
                
                setWeightForm({
                    date: formatDate(new Date()),
                    weight: "",
                    height: ""
                });
                setIsWeightDialogOpen(false);
            } catch (error) {
                // Improved logging for Axios errors
                if (axios.isAxiosError(error)) {
                    console.error("Error adding weight - status:", error.response?.status, "data:", error.response?.data || error.message);
                    // Quick user-visible feedback while debugging
                    // eslint-disable-next-line no-alert
                    alert(`Failed to add weight: ${error.response?.status} - ${JSON.stringify(error.response?.data || error.message)}`);
                } else {
                    console.error("Error adding weight:", error);
                    // eslint-disable-next-line no-alert
                    alert(`Failed to add weight: ${String(error)}`);
                }
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
        <section id="Health Analytics" className="bg-transparent p-2 sm:p-4 lg:p-6">
                
                
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-center mb-4 sm:mb-6 lg:mb-8 text-gray-300">
            Health Analytics
          </h2>
        </div>
        
       
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 bg-transparent px-2 sm:px-4 lg:px-6 xl:px-8">
                    {/* BMI Chart */}
                    <Card className='group bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 lg:hover:-translate-y-3 flex flex-col overflow-hidden relative'>
                        <CardHeader className="p-3 sm:p-4 lg:p-6">
                            <CardTitle className="flex items-center gap-2 text-white text-sm sm:text-base lg:text-lg">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                                BMI Variation
                            </CardTitle>
                            <CardDescription className='text-white text-xs sm:text-sm mb-2 sm:mb-4'>
                                Body Mass Index tracking over time
                                <br />
                                <span className="text-xs text-gray-500">
                                    Current: {bmiData.length > 0 ? bmiData[bmiData.length - 1].bmi : 'N/A'} BMI
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                            <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px] lg:!h-[350px]">
                                <LineChart data={bmiData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }} className="sm:!mx-[20px] lg:!mx-[30px]">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="day" 
                                        tick={{ fontSize: 10 }}
                                        className="sm:!text-xs lg:!text-sm"
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis 
                                        domain={["dataMin - 0.5", "dataMax + 0.5"]} 
                                        tick={{ fontSize: 10 }}
                                        className="sm:!text-xs lg:!text-sm"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="bmi" 
                                        stroke="#ef4444" 
                                        strokeWidth={2}
                                        dot={{ fill: '#ef4444', strokeWidth: 1, r: 3 }}
                                        activeDot={{ r: 4, stroke: '#dc2626', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-2 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 text-center">
                                <div className="p-1 sm:p-2 bg-gray-700 rounded-lg">
                                    <p className="text-[10px] sm:text-xs text-gray-200">Average BMI</p>
                                    <p className="text-xs sm:text-sm font-semibold text-red-600">
                                        {bmiData.length > 0 ? (bmiData.reduce((sum, d) => sum + d.bmi, 0) / bmiData.length).toFixed(1) : '0'}
                                    </p>
                                </div>
                                <div className="p-1 sm:p-2 bg-gray-700 rounded-lg">
                                    <p className="text-[10px] sm:text-xs text-gray-200">Min BMI</p>
                                    <p className="text-xs sm:text-sm font-semibold text-green-600">
                                        {bmiData.length > 0 ? Math.min(...bmiData.map(d => d.bmi)).toFixed(1) : '0'}
                                    </p>
                                </div>
                                <div className="p-1 sm:p-2 bg-gray-700 rounded-lg">
                                    <p className="text-[10px] sm:text-xs text-gray-200">Max BMI</p>
                                    <p className="text-xs sm:text-sm font-semibold text-orange-600">
                                        {bmiData.length > 0 ? Math.max(...bmiData.map(d => d.bmi)).toFixed(1) : '0'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weight Chart */}
                    <Card className='group bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 lg:hover:-translate-y-3 flex flex-col overflow-hidden relative'>
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
                            <div className="flex-1 min-w-0">
                                <CardTitle className="flex items-center gap-2 text-white text-sm sm:text-base lg:text-lg">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                                    Weight Variation
                                </CardTitle>
                                <CardDescription className='text-white text-xs sm:text-sm'>
                                    Weight tracking over time
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        Current: {weightData.length > 0 ? weightData[weightData.length - 1].weight : 'N/A'} kg
                                    </span>
                                </CardDescription>
                            </div>
                            <Dialog open={isWeightDialogOpen} onOpenChange={setIsWeightDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="shrink-0 bg-red-500 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        <span className="hidden sm:inline">Add Weight</span>
                                        <span className="sm:hidden">Add</span>
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
                                            <Input className='bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500 [color-scheme:dark]'
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
                                            <Label htmlFor="height">Height (cm)</Label>
                                            <Input className='bg-gray-800'
                                                id="height"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="3"
                                                value={weightForm.height}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                                    setWeightForm(prev => ({ ...prev, height: e.target.value }))}
                                                placeholder="Enter height (e.g., 175)"
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
                        <CardContent className="p-3 sm:p-4 lg:p-6">
                            <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px] lg:!h-[350px]">
                                <LineChart data={weightData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }} className="sm:!mx-[20px] lg:!mx-[30px]">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="day" 
                                        tick={{ fontSize: 10 }}
                                        className="sm:!text-xs lg:!text-sm"
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis 
                                        domain={["dataMin - 1", "dataMax + 1"]} 
                                        tick={{ fontSize: 10 }}
                                        className="sm:!text-xs lg:!text-sm"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="weight" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
                                        activeDot={{ r: 4, stroke: '#1e40af', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="mt-2 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 text-center">
                                <div className="p-1 sm:p-2 bg-gray-700 rounded-lg">
                                    <p className="text-[10px] sm:text-xs text-gray-200">Average Weight</p>
                                    <p className="text-xs sm:text-sm font-semibold text-blue-600">
                                        {weightData.length > 0 ? (weightData.reduce((sum, d) => sum + d.weight, 0) / weightData.length).toFixed(1) : '0'} kg
                                    </p>
                                </div>
                                <div className="p-1 sm:p-2 bg-gray-700 rounded-lg">
                                    <p className="text-[10px] sm:text-xs text-gray-200">Weight Change</p>
                                    <p className="text-xs sm:text-sm font-semibold text-green-600">
                                        {weightData.length > 1 ? 
                                            `${(weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)} kg` : '0 kg'}
                                    </p>
                                </div>
                                <div className="p-1 sm:p-2 bg-gray-700 rounded-lg">
                                    <p className="text-[10px] sm:text-xs text-gray-200">Goal Progress</p>
                                    <p className="text-xs sm:text-sm font-semibold text-purple-600">
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
