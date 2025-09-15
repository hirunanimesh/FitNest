"use client"

import React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDateForDisplay } from "@/lib/chartUtils"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onDateRangeChange: (startDate: string, endDate: string) => void
  className?: string
}

export function DateRangePicker({ startDate, endDate, onDateRangeChange, className }: DateRangePickerProps) {
  // Generate options for the last 3 years
  const generateMonthOptions = () => {
    const options = []
    const currentDate = new Date()
    
    for (let i = 36; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const value = date.toISOString().slice(0, 7) // YYYY-MM format
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      options.push({ value, label })
    }
    
    return options
  }

  const monthOptions = generateMonthOptions()

  const handleStartDateChange = (value: string) => {
    // Ensure end date is not before start date
    if (value > endDate) {
      onDateRangeChange(value, value)
    } else {
      onDateRangeChange(value, endDate)
    }
  }

  const handleEndDateChange = (value: string) => {
    // Ensure start date is not after end date
    if (value < startDate) {
      onDateRangeChange(value, value)
    } else {
      onDateRangeChange(startDate, value)
    }
  }

  const setQuickRange = (months: number) => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - months + 1)
    
    const endDateStr = end.toISOString().slice(0, 7)
    const startDateStr = start.toISOString().slice(0, 7)
    
    onDateRangeChange(startDateStr, endDateStr)
  }

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CalendarIcon className="w-4 h-4" />
            <span>Select Time Period</span>
          </div>
          
          {/* Quick Selection Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickRange(3)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Last 3 Months
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickRange(6)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Last 6 Months
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickRange(12)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Last Year
            </Button>
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">From</label>
              <Select value={startDate} onValueChange={handleStartDateChange}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {monthOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-white hover:bg-gray-600"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-400">To</label>
              <Select value={endDate} onValueChange={handleEndDateChange}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {monthOptions
                    .filter(option => option.value >= startDate)
                    .map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-white hover:bg-gray-600"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Selection Display */}
          <div className="text-xs text-gray-500 border-t border-gray-700 pt-3">
            Showing data from {formatDateForDisplay(startDate)} to {formatDateForDisplay(endDate)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}