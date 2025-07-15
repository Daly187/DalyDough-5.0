"use client";

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { DScore } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MeatMarketTableProps {
  data: DScore[];
}

const gradeColors = {
  A: 'bg-green-500/20 text-green-400 border-green-500/30',
  B: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  C: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const signalConfig = {
    Buy: { color: "text-green-400", icon: <ArrowUp className="h-4 w-4" />, label: "Allow Buy" },
    Sell: { color: "text-red-400", icon: <ArrowDown className="h-4 w-4" />, label: "Allow Sell" },
    Block: { color: "text-muted-foreground", icon: <Minus className="h-4 w-4" />, label: "Block" },
}

export default function MeatMarketTable({ data }: MeatMarketTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">The Meat Market</CardTitle>
        <CardDescription>High-probability trading opportunities based on the D-Size Scoring System.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair</TableHead>
              <TableHead>D-Score</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>COT</TableHead>
              <TableHead>ADX</TableHead>
              <TableHead>Spread</TableHead>
              <TableHead className="text-right">Entry Signal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const signal = signalConfig[item.signal];
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.pair}</TableCell>
                  <TableCell className="font-semibold text-lg text-primary">{item.dScore.toFixed(1)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-bold", gradeColors[item.grade])}>
                        {item.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.cot}</TableCell>
                  <TableCell>{item.adx}</TableCell>
                  <TableCell>{item.spread.toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <div className={cn("flex items-center justify-end gap-2 font-medium", signal.color)}>
                        {signal.icon}
                        {signal.label}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
