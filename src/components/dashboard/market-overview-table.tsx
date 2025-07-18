

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
import { ArrowUp, ArrowDown, Minus, ArrowUpDown } from 'lucide-react';
import type { DScore } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';

interface MarketOverviewTableProps {
  data: DScore[];
  isLoading: boolean;
}

type SortKey = keyof DScore;

const signalConfig = {
    Buy: { color: "text-green-400", icon: <ArrowUp className="h-4 w-4" />, label: "Buy" },
    Sell: { color: "text-red-400", icon: <ArrowDown className="h-4 w-4" />, label: "Sell" },
    Block: { color: "text-muted-foreground", icon: <Minus className="h-4 w-4" />, label: "Block" },
}

export default function MarketOverviewTable({ data, isLoading }: MarketOverviewTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('dScore');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const sortedData = React.useMemo(() => {
    // Sort by absolute value for the overview table to show strongest signals first
    return [...data].sort((a, b) => {
      const aValue = Math.abs(a[sortKey] as number);
      const bValue = Math.abs(b[sortKey] as number);

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

  const formatScore = (score: number) => {
    return (score > 0 ? '+' : '') + score.toFixed(1);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Market Overview</CardTitle>
          <CardDescription>High-probability trading opportunities based on the D-Score System.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader tkey="pair" label="Pair" />
                  <SortableHeader tkey="dScore" label="D-Score" />
                  <SortableHeader tkey="trendAlignment" label="Trend" />
                  <SortableHeader tkey="adxStrength" label="ADX" />
                  <SortableHeader tkey="rsiMomentum" label="RSI" />
                  <TableHead className="text-right">Entry Signal</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  sortedData.map((item) => {
                    const signal = signalConfig[item.signal];
                    const isPriceValid = typeof item.price === 'number' && item.price > 0;
                    const isChangeValid = typeof item.changesPercentage === 'number';

                    return (
                      <TableRow key={item.id} className="cursor-pointer">
                        <TableCell>
                          <div className="font-medium">{item.pair}</div>
                          <div className={cn("text-xs", item.change >= 0 ? 'text-green-400' : 'text-red-400')}>
                            {isPriceValid ? item.price.toFixed(item.pair.includes('JPY') ? 3 : 5) : 'N/A'}
                            {isPriceValid && isChangeValid && (
                              <span className="ml-1">({item.changesPercentage.toFixed(2)}%)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={cn(
                            "font-semibold text-lg",
                            item.dScore > 0 ? "text-green-400" : item.dScore < 0 ? "text-red-400" : "text-primary"
                        )}>
                            {formatScore(item.dScore)}
                        </TableCell>
                        <TableCell className={cn(item.trendAlignment > 0 ? "text-green-400/80" : "text-red-400/80")}>{item.trendAlignment.toFixed(1)}</TableCell>
                        <TableCell>{item.adxStrength.toFixed(1)}</TableCell>
                        <TableCell className={cn(item.rsiMomentum > 0 ? "text-green-400/80" : "text-red-400/80")}>{item.rsiMomentum.toFixed(1)}</TableCell>
                        <TableCell className="text-right">
                          <div className={cn("flex items-center justify-end gap-2 font-medium", signal.color)}>
                              {signal.icon}
                              {signal.label}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
