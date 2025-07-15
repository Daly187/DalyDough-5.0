"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

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
import type { EquityData } from "@/lib/types"

interface EquityCurveChartProps {
  data: EquityData[]
}

const chartConfig = {
  equity: {
    label: "Equity",
    color: "hsl(var(--primary))",
  },
}

export default function EquityCurveChart({ data }: EquityCurveChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Equity Curve</CardTitle>
        <CardDescription>Account equity over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
                domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
                <linearGradient id="fillEquity" x1="0" y1="0" x2="0" y2="1">
                <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.8}
                />
                <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.1}
                />
                </linearGradient>
            </defs>
            <Area
              dataKey="equity"
              type="natural"
              fill="url(#fillEquity)"
              stroke="hsl(var(--primary))"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
