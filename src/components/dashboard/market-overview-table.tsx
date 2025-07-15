
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
import { ArrowUp, ArrowDown, Minus, ArrowUpDown } from 'lucide-react';
import type { DScore } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MarketOverviewTableProps {
  data: DScore[];
}

type SortKey = keyof DScore;

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

const TrendIndicator = ({ trend }: { trend: 'buy' | 'sell' }) => (
    trend === 'buy'
        ? <ArrowUp className="h-4 w-4 text-green-400" />
        : <ArrowDown className="h-4 w-4 text-red-400" />
);


export default function MarketOverviewTable({ data }: MarketOverviewTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('dScore');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const SortableHeader = ({ tkey, label, className }: { tkey: SortKey; label: string; className?: string }) => (
    <TableHead className={className}>
      <Button variant="ghost" onClick={() => handleSort(tkey)} className="px-0 hover:bg-transparent">
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Market Overview</CardTitle>
        <CardDescription>High-probability trading opportunities based on the D-Size Scoring System.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader tkey="pair" label="Pair" />
                <SortableHeader tkey="dScore" label="D-Score" />
                <SortableHeader tkey="grade" label="Grade" />
                <TableHead>Trend (4h/1d/1w)</TableHead>
                <SortableHeader tkey="trendAlignment" label="Trend Score" />
                <SortableHeader tkey="adxStrength" label="ADX" />
                <TableHead className="text-right">Entry Signal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => {
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
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <TrendIndicator trend={item.trends.h4} />
                           <TrendIndicator trend={item.trends.d1} />
                           <TrendIndicator trend={item.trends.w1} />
                        </div>
                    </TableCell>
                    <TableCell className="font-semibold">{item.trendAlignment.toFixed(1)}</TableCell>
                    <TableCell>{item.adxStrength.toFixed(1)}</TableCell>
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
