
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
import { ArrowUpDown } from 'lucide-react';
import type { DScore, IndicatorSet } from '@/lib/types'; // Using DScore now
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MarketDetailTableProps {
  data: DScore[];
}

// The data is already processed into DScore format, which includes what we need.
type ProcessedData = DScore;

type SortKey = 'pair' | 'price' | 'change' | 'lastUpdated';

const formatValue = (value: any, fixed: number = 2) => {
    if (typeof value === 'number') {
        return value.toFixed(fixed);
    }
    return 'N/A';
};

const formatTimestamp = (timestamp?: any) => {
    if (typeof timestamp === 'number') {
        return new Date(timestamp * 1000).toLocaleString();
    }
    return 'N/A';
};

export default function MarketDetailTable({ data }: MarketDetailTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('pair');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  // Data is already in the right format.
  const processedData: ProcessedData[] = data;

  const sortedData = React.useMemo(() => {
    return [...processedData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
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

  const IndicatorCell = ({ indicatorValue, toFixed = 2 }: { indicatorValue: number | undefined | {macd?: any, histogram?: any} | {k?: any, d?: any}, toFixed?: number }) => {
    if (typeof indicatorValue === 'object' && indicatorValue !== null) {
      if ('macd' in indicatorValue) { // MACD object
        return (
          <TableCell>
            <div>H: {formatValue(indicatorValue.histogram, 5)}</div>
            <div>M: {formatValue(indicatorValue.macd, 5)}</div>
          </TableCell>
        );
      }
       if ('k' in indicatorValue) { // Stochastic object
        return (
          <TableCell>
            <div>K: {formatValue(indicatorValue.k, toFixed)}</div>
            <div>D: {formatValue(indicatorValue.d, toFixed)}</div>
          </TableCell>
        );
      }
    }
    return <TableCell>{formatValue(indicatorValue, toFixed)}</TableCell>;
  };
  
  // NOTE: This table is showing component scores, not raw indicator values. This is a simplification
  // to fit the new data structure. A future refactor could pass down the raw indicators if needed.
  return (
      <ScrollArea className="h-[75vh] border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <SortableHeader tkey="pair" label="Pair" />
              <SortableHeader tkey="price" label="Price" />
              <SortableHeader tkey="change" label="Change" />
              <SortableHeader tkey="lastUpdated" label="Last Update" />
              <TableHead>Trend (3.0)</TableHead>
              <TableHead>ADX (1.5)</TableHead>
              <TableHead>RSI (1.0)</TableHead>
              <TableHead>MACD (1.0)</TableHead>
              <TableHead>ATR (1.0)</TableHead>
              <TableHead>BB (0.5)</TableHead>
              <TableHead>Stoch (0.5)</TableHead>
              <TableHead>SAR (0.5)</TableHead>
              <TableHead>CCI (0.5)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.pair}>
                <TableCell className="font-medium">{item.pair}</TableCell>
                <TableCell className="font-semibold text-primary">{formatValue(item.price, 5)}</TableCell>
                <TableCell className={cn(item.change && item.change >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {formatValue(item.change, 4)}
                </TableCell>
                <TableCell>{formatTimestamp(item.lastUpdated)}</TableCell>
                <TableCell>{formatValue(item.trendAlignment, 1)}</TableCell>
                <TableCell>{formatValue(item.adxStrength, 1)}</TableCell>
                <TableCell>{formatValue(item.rsiMomentum, 1)}</TableCell>
                <TableCell>{formatValue(item.macdMomentum, 1)}</TableCell>
                <TableCell>{formatValue(item.atrVolatility, 1)}</TableCell>
                <TableCell>{formatValue(item.bollingerBands, 1)}</TableCell>
                <TableCell>{formatValue(item.stochasticOscillator, 1)}</TableCell>
                <TableCell>{formatValue(item.parabolicSAR, 1)}</TableCell>
                <TableCell>{formatValue(item.cci, 1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
  );
}
