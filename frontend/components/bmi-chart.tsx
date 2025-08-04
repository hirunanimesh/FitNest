"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Jan", bmi: 25.1 },
  { month: "Feb", bmi: 24.8 },
  { month: "Mar", bmi: 24.5 },
  { month: "Apr", bmi: 24.3 },
  { month: "May", bmi: 24.2 },
  { month: "Jun", bmi: 24.2 },
]

const chartConfig = {
  bmi: {
    label: "BMI",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function BMIChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>BMI Variation</CardTitle>
        <CardDescription>Your BMI changes over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={["dataMin - 1", "dataMax + 1"]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="bmi"
              type="monotone"
              stroke="var(--color-bmi)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-bmi)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
