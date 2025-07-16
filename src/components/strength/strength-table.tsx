
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
  const getLastFiveDaysData = (data: { date: string; strength: number }[]) => {
    return data.slice(-5);
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {strengthData.map((currency) => {
          const fiveDays = getLastFiveDaysData(currency.data);
          let prevStrength = currency.data[currency.data.length - 6]?.strength ?? fiveDays[0].strength;

          return (
            <TableRow key={currency.currency}>
              <TableCell className="font-medium">{currency.currency}</TableCell>
              {fiveDays.map((day, index) => {
                const isUp = day.strength >= prevStrength;
                prevStrength = day.strength;
                return (
                  <TableCell key={index} className="text-center">
                    <div className="flex justify-center">
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
