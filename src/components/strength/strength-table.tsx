
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrengthData } from "@/lib/types";

interface StrengthTableProps {
  strengthData: StrengthData[];
}

export default function StrengthTable({ strengthData }: StrengthTableProps) {
  const getLastTenDaysData = (data: { date: string; strength: number }[]) => {
    // We need 11 items to compare 10 days
    return data.slice(-11);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Currency</TableHead>
          <TableHead className="text-center">Day 1</TableHead>
          <TableHead className="text-center">Day 2</TableHead>
          <TableHead className="text-center">Day 3</TableHead>
          <TableHead className="text-center">Day 4</TableHead>
          <TableHead className="text-center">Day 5</TableHead>
          <TableHead className="text-center">Day 6</TableHead>
          <TableHead className="text-center">Day 7</TableHead>
          <TableHead className="text-center">Day 8</TableHead>
          <TableHead className="text-center">Day 9</TableHead>
          <TableHead className="text-center">Day 10</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {strengthData.map((currency) => {
          const elevenDays = getLastTenDaysData(currency.data);
          return (
            <TableRow key={currency.currency}>
              <TableCell className="font-medium">{currency.currency}</TableCell>
              {elevenDays.slice(1).map((day, index) => {
                const prevStrength = elevenDays[index].strength; // Compare with the previous day
                const isUp = day.strength >= prevStrength;
                const isDXY = currency.currency === 'USD';

                return (
                  <TableCell key={index} className="text-center">
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-xs text-muted-foreground">{day.strength.toFixed(isDXY ? 2 : 4)}</span>
                        {isUp ? (
                            <ArrowUp className="h-5 w-5 text-green-500" />
                        ) : (
                            <ArrowDown className="h-5 w-5 text-red-500" />
                        )}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
