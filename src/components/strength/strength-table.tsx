
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
  // We need 11 days of data to calculate 10 days of trends
  const getLastElevenDaysData = (data: { date: string; strength: number }[]) => {
    return data.slice(-11);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Currency</TableHead>
          {Array.from({ length: 10 }).map((_, i) => (
             <TableHead key={i} className="text-center">Day {i + 1}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {strengthData.map((currency) => {
          const elevenDays = getLastElevenDaysData(currency.data);
          // If we don't have enough data, don't render the row
          if (elevenDays.length < 11) {
            return (
                <TableRow key={currency.currency}>
                    <TableCell className="font-medium">{currency.currency}</TableCell>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">Not enough data to display trend.</TableCell>
                </TableRow>
            );
          }
          return (
            <TableRow key={currency.currency}>
              <TableCell className="font-medium">{currency.currency}</TableCell>
              {/* We slice from the second day (index 1) to show 10 days of trends */}
              {elevenDays.slice(1).map((day, index) => {
                // The previous day is at the same index in the original `elevenDays` array
                const prevDay = elevenDays[index];
                const isUp = day.strength >= prevDay.strength;

                return (
                  <TableCell key={day.date} className="text-center">
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-xs text-muted-foreground">{day.strength.toFixed(2)}</span>
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
