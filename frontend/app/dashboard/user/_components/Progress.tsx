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
        <div className="w-full px-2 sm:px-4">
            {/* Mobile: Single column, Tablet: 2 columns, Desktop: 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                
                {/* Weight Card */}
                <Card className="bg-transparent w-full h-full">
                    <CardContent className="p-3 sm:p-4 lg:p-6 bg-transparent h-full">
                        <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border border-silver rounded-lg h-full min-h-[80px] sm:min-h-[90px] lg:min-h-[100px]">
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-xs sm:text-sm text-red-500 mb-2">
                                    Weight
                                </p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-500 truncate">
                                    {weightData || "--"} kg
                                </p>
                            </div>
                            <Weight className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-red-500 flex-shrink-0 ml-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Height Card */}
                <Card className="bg-transparent w-full h-full">
                    <CardContent className="p-3 sm:p-4 lg:p-6 bg-transparent h-full">
                        <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border border-silver rounded-lg h-full min-h-[80px] sm:min-h-[90px] lg:min-h-[100px]">
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-xs sm:text-sm text-red-500 mb-2">
                                    Height
                                </p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-500 truncate">
                                    {heightData || "--"} cm
                                </p>
                            </div>
                            <Ruler className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-red-500 flex-shrink-0 ml-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* BMI Card */}
                <Card className="bg-transparent w-full h-full">
                    <CardContent className="p-3 sm:p-4 lg:p-6 bg-transparent h-full">
                        <div className="flex items-center justify-between p-4 sm:p-5 lg:p-6 border border-silver rounded-lg h-full min-h-[80px] sm:min-h-[90px] lg:min-h-[100px]">
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-xs sm:text-sm text-red-500 mb-2">
                                    BMI ({getBMICategory()})
                                </p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-500 truncate">
                                    {calculateBMI() || "--"}
                                </p>
                            </div>
                            <Activity className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-red-500 flex-shrink-0 ml-2" />
                        </div>
                    </CardContent>
                </Card>   
            </div>
        </div>
    )
}

export default Progress