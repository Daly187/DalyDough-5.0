"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { CotData } from "@/lib/types";
import * as React from "react";

interface CotChartProps {
  data: CotData[];
}

const chartConfig = {
  long: {
    label: "Long",
    color: "hsl(var(--chart-2))",
  },
  short: {
    label: "Short",
    color: "hsl(var(--chart-5))",
  },
};

export default function CotChart({ data }: CotChartProps) {
  const [selectedCurrency, setSelectedCurrency] = React.useState(data[0].currency);

  const chartData = data.find(d => d.currency === selectedCurrency)?.data.map(item => ({
    ...item,
    net: item.long - item.short
  }));

  return (
    <div className="space-y-4">
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
                {data.map(d => <SelectItem key={d.currency} value={d.currency}>{d.currency}</SelectItem>)}
            </SelectContent>
        </Select>

        <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis 
                    tickFormatter={(value) => `${Number(value) / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Legend />
                <Bar dataKey="long" name="Long Positions" fill="var(--color-long)" stackId="a" />
                <Bar dataKey="short" name="Short Positions" fill="var(--color-short)" stackId="a" />
            </BarChart>
        </ChartContainer>
    </div>
  )
}
