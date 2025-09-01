"use client";
import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { Weight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Ruler, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'
import { GetLatestWeight } from '@/lib/api';

const Progress = () => {
    const [weightData, setWeightData] = useState<number |null >(null);
    const [heightData, setHeightData] = useState<number |null>(null);
    const { getUserProfileId } = useAuth();

    // Calculate BMI
    const calculateBMI = () => {
        if (weightData && heightData && heightData > 0) {
            const bmi = weightData / (heightData * heightData*0.0001);
            return bmi.toFixed(3);
        }
        return null;
    };

    // Get BMI category
    const getBMICategory = () => {
        const bmi = calculateBMI();
        
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal range";
        if (bmi < 30) return "Overweight";
        return "Obese";
    };

    useEffect(() => {
        async function fetchAllData() {
            try {
                const customerId = await getUserProfileId();
                        if (customerId) {
                          const data = await GetLatestWeight(customerId);
                          //console.log(data);
                          
                            setWeightData(data.weight.weight);
                            setHeightData(data.weight.height);
                            }
                } catch (error) {
                            setWeightData(null);
                            setHeightData(null);
                }
        }
    fetchAllData();
    }, [getUserProfileId]);

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-start">
                <Card>
                    <CardContent className="p-6 bg-black">
                        <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground text-blue-500">Weight</p>
                                <p className="text-2xl font-bold text-blue-500">
                                    {weightData} kg
                                </p>
                            </div>
                            <Weight className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 bg-black">
                        <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Height</p>
                                <p className="text-2xl font-bold text-green-500">
                                    {heightData} cm
                                </p>
                            </div>
                            <Ruler className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 bg-black">
                    <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                        <div>
                        <p className="text-sm text-muted-foreground">BMI</p>
                        <p className="text-2xl font-bold text-purple-500">
                            {calculateBMI() || "--"}
                        </p>
                        <p className="text-xs text-muted-foreground">{getBMICategory()}</p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                    </div>
                    </CardContent>
                </Card>   
    </div>
    </div>
  )
}
export default Progress
