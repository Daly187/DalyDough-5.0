
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
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, ArrowUpDown, Minus } from 'lucide-react';
import type { DScore } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { format as formatDate } from 'date-fns';

interface MarketDetailTableProps {
  data: DScore[];
}

type SortKey = keyof DScore;

const formatValue = (value: any, fixed: number = 2) => {
    if (typeof value === 'number') {
        return (value > 0 ? '+' : '') + value.toFixed(fixed);
    }
    return 'N/A';
};

const formatPrice = (value: any, fixed: number = 2) => {
    if (typeof value === 'number') {
        return value.toFixed(fixed);
    }
    return 'N/A';
}

const formatTimestamp = (timestamp?: any) => {
    if (typeof timestamp === 'number' && timestamp > 0) {
        try {
            return formatDate(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
        } catch (e) {
            return 'Invalid Date'
        }
    }
    return 'N/A';
};

const signalConfig = {
    Buy: { label: "Buy" },
    Sell: { label: "Sell" },
    Block: { label: "Block" },
};

export default function MarketDetailTable({ data }: MarketDetailTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('dScore');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const processedData: DScore[] = data;

  const sortedData = React.useMemo(() => {
    return [...processedData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      // For dScore, sort by absolute value to find strongest signals
      if (sortKey === 'dScore') {
          const absA = Math.abs(aValue as number);
          const absB = Math.abs(bValue as number);
          if (absA < absB) return sortOrder === 'asc' ? -1 : 1;
          if (absA > absB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
      }
      
      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [processedData, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key as SortKey);
      setSortOrder('desc');
    }
  };

  const SortableHeader = ({ tkey, label, className }: { tkey: SortKey; label: string; className?: string }) => (
    <TableHead className={className}>
      <Button variant="ghost" onClick={() => handleSort(tkey)} className="px-2 hover:bg-transparent">
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );
  
  return (
      <ScrollArea className="h-[75vh] border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <SortableHeader tkey="pair" label="Pair" />
              <SortableHeader tkey="price" label="Price" />
              <SortableHeader tkey="change" label="Change" />
              <SortableHeader tkey="lastUpdated" label="Last Update" />
              <SortableHeader tkey="dScore" label="D-Score" />
              <SortableHeader tkey="signal" label="Signal" />
              <SortableHeader tkey="trendAlignment" label="Trend (4.0)" />
              <SortableHeader tkey="adxStrength" label="ADX (2.5)" />
              <SortableHeader tkey="atrVolatility" label="ATR (1.5)" />
              <SortableHeader tkey="macdMomentum" label="MACD (1.0)" />
              <SortableHeader tkey="confirmationIndicators" label="Confirm (1.0)" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.pair}>
                <TableCell className="font-medium">{item.pair}</TableCell>
                <TableCell className="font-semibold text-primary">{formatPrice(item.price, 5)}</TableCell>
                <TableCell className={cn(item.change >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {formatPrice(item.change, 4)}
                </TableCell>
                <TableCell>{formatTimestamp(item.lastUpdated)}</TableCell>
                <TableCell className={cn("font-semibold text-lg", item.dScore > 0 ? "text-green-400" : "text-red-400")}>
                  {formatValue(item.dScore, 1)}
                </TableCell>
                <TableCell>
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-xs",
                            item.signal === 'Buy' && 'bg-green-500/20 text-green-400 border-green-500/30',
                            item.signal === 'Sell' && 'bg-red-500/20 text-red-400 border-red-500/30',
                            item.signal === 'Block' && 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        )}
                    >
                        {signalConfig[item.signal]?.label ?? 'Block'}
                    </Badge>
                </TableCell>
                <TableCell>{formatValue(item.trendAlignment, 1)}</TableCell>
                <TableCell>{formatValue(item.adxStrength, 1)}</TableCell>
                <TableCell>{formatValue(item.atrVolatility, 1)}</TableCell>
                <TableCell>{formatValue(item.macdMomentum, 1)}</TableCell>
                <TableCell>{formatValue(item.confirmationIndicators, 1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
  );
}
