"use client";
import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { Weight } from 'lucide-react';
import { Ruler, Activity } from 'lucide-react';
import { useUserData } from '../context/UserContext';

const Progress = () => {
    const { userData } = useUserData();
    
    // Use data from UserContext
    const weightData = userData?.currentWeight || null;
    const heightData = userData?.height || null;

    // Calculate BMI
    const calculateBMI = () => {
        if (weightData && heightData && heightData > 0) {
            const heightInMeters = heightData / 100; // Convert cm to meters
            const bmi = weightData / (heightInMeters * heightInMeters);
            return bmi.toFixed(3);
        }
        return null;
    };

    // Get BMI category
    const getBMICategory = () => {
        const bmi = calculateBMI();
        if (!bmi) return "No data";
        
        const bmiValue = parseFloat(bmi);
        if (bmiValue < 18.5) return "Underweight";
        if (bmiValue < 25) return "Normal range";
        if (bmiValue < 30) return "Overweight";
        return "Obese";
    };

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
