"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { GetLatestWeight } from '@/lib/api'

interface FitnessDataProps {
  userData: any
  setUserData: (data: any) => void
  isEditing: boolean
}

export function FitnessData({ userData, setUserData, isEditing }: FitnessDataProps) {
  const [weightData, setWeightData] = useState<number | null>(null);
  const [heightData, setHeightData] = useState<number | null>(null);
  const { getUserProfileId } = useAuth();

  // Calculate BMI
  const calculateBMI = () => {
    if (weightData && heightData && heightData > 0) {
      const bmi = weightData / (heightData * heightData * 0.0001);
      return bmi.toFixed(2);
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

  useEffect(() => {
    async function fetchAllData() {
      try {
        const customerId = await getUserProfileId();
        if (customerId) {
          const data = await GetLatestWeight(customerId);
          setWeightData(data.weight.weight);
          setHeightData(data.weight.height);
          
          // Update userData with fetched values
          setUserData({ 
            ...userData, 
            weight: data.weight.weight,
            height: data.weight.height
          });
        }
      } catch (error) {
        setWeightData(null);
        setHeightData(null);
      }
    }
    fetchAllData();
  }, [getUserProfileId]);

  return (
    <Card className="bg-[#192024] text-white">
      <CardHeader>
        <CardTitle>Fitness Metrics</CardTitle>
        <CardDescription>Track your physical measurements and fitness goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Current Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={userData.weight}
              disabled
              min="0"
              className="bg-[#192024] text-white"
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={userData.height}
              disabled
              min="0"
              className="bg-[#192024] text-white"
              readOnly
            />
          </div>
        </div>

        {/* BMI Display */}
        <div className="p-4 bg-[#192024] rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Current BMI</p>
              <p className="text-2xl font-bold">
                {calculateBMI()}
              </p>
            </div>
            <Badge variant="secondary">{getBMICategory()}</Badge>
          </div>
        </div>

        
        
      </CardContent>
    </Card>
  )
}
