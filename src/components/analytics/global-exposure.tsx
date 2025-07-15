"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ExposureData } from "@/lib/types"

interface GlobalExposureProps {
  data: ExposureData[]
}

const chartConfig = {
  exposure: {
    label: "Exposure",
  },
  long: {
    label: "Long",
    color: "hsl(var(--chart-2))",
  },
  short: {
    label: "Short",
    color: "hsl(var(--chart-5))",
  },
}

export default function GlobalExposure({ data }: GlobalExposureProps) {
  const chartData = data.map(item => ({
    currency: item.currency,
    long: item.type === 'long' ? item.exposure : 0,
    short: item.type === 'short' ? -Math.abs(item.exposure) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Global Exposure</CardTitle>
        <CardDescription>Live currency exposure across all bots</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            stackOffset="sign"
            margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <YAxis
              dataKey="currency"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${Number(value) / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Legend />
            <Bar dataKey="long" fill="var(--color-long)" stackId="a" name="Long" />
            <Bar dataKey="short" fill="var(--color-short)" stackId="a" name="Short" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
