
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { CurrencyStrength } from "@/lib/types";

interface StrengthIndexTableProps {
  data: CurrencyStrength[];
}

export default function StrengthIndexTable({ data }: StrengthIndexTableProps) {
  // Sort data from strongest to weakest
  const sortedData = [...data].sort((a, b) => b.strength - a.strength);

  const getStrengthColor = (strength: number) => {
    if (strength > 7) return "bg-green-500";
    if (strength > 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Currency</TableHead>
          <TableHead>Strength Meter</TableHead>
          <TableHead className="text-right w-[100px]">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item) => (
          <TableRow key={item.currency}>
            <TableCell className="font-medium">{item.currency}</TableCell>
            <TableCell>
              <Progress value={item.strength * 10} className="h-2 [&>div]:bg-primary" />
            </TableCell>
            <TableCell className="text-right font-semibold">{item.strength.toFixed(1)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
