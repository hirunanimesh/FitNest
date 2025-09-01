"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface FitnessDataProps {
  userData: any
  setUserData: (data: any) => void
  isEditing: boolean
}

export function FitnessData({ userData, setUserData, isEditing }: FitnessDataProps) {
  // Use data from UserContext (no API calls needed)
  const currentWeight = userData.currentWeight || null;
  const height = userData.height || null;

  // Calculate BMI
  const calculateBMI = () => {
    if (currentWeight && height && height > 0) {
      const heightInMeters = height / 100; // Convert cm to meters
      const bmi = currentWeight / (heightInMeters * heightInMeters);
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
              value={currentWeight || ""}
              disabled
              min="0"
              className="bg-[#192024] text-white"
              readOnly
              placeholder="No weight data"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={height || ""}
              disabled
              min="0"
              className="bg-[#192024] text-white"
              readOnly
              placeholder="No height data"
            />
          </div>
        </div>

        {/* BMI Display */}
        <div className="p-4 bg-[#192024] rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Current BMI</p>
              <p className="text-2xl font-bold">
                {calculateBMI() || "N/A"}
              </p>
            </div>
            <Badge variant="secondary">{getBMICategory()}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
