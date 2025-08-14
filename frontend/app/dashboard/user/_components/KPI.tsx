import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { Weight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Ruler, Activity } from 'lucide-react';

interface ProgressEntry {
    date: string;
    weight: number;
    height: number;
 }

const KPI = () => {
    const [weightData, setWeightData] = useState<{ day: string; weight: number }[]>([]);
  return (
    <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-start">
            <Card>
                    <CardContent className="p-6 bg-black">
                    <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                        <div >
                        <p className="text-sm text-muted-foreground text-blue-500">Weight</p>
                        <p className="text-2xl font-bold text-blue-500">{weightData[weightData.length - 1]?.weight || "-"} kg</p>
                        <p className="text-xs text-muted-foreground text-blue-500">
                            {weightData.length > 1
                            ? `${(weightData[weightData.length - 1]?.weight - weightData[weightData.length - 2]?.weight).toFixed(1)} kg from yesterday`
                            : "No data available"}
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
                        <p className="text-2xl font-bold text-green-500">175 cm</p>
                        <p className="text-xs text-muted-foreground">No change</p>
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
                        <p className="text-2xl font-bold text-purple-500">24.0</p>
                        <p className="text-xs text-muted-foreground">Normal range</p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                    </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 bg-black">
                    <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                        <div>
                        <p className="text-sm text-muted-foreground">Days Tracked</p>
                        <p className="text-2xl font-bold text-purple-500">30</p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                    </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 bg-black">
                    <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                        <div>
                        <p className="text-sm text-muted-foreground">Total Records</p>
                        <p className="text-2xl font-bold text-purple-500">30</p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                    </div>
                    </CardContent>
                </Card>
    </div>
    </div>
  )
}

export default KPI
