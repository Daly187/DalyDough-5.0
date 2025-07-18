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
import type { ForexData, IndicatorSet } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MarketDetailTableProps {
  data: ForexData[];
}

type ProcessedData = {
    pair: string;
    price?: number;
    change?: number;
    timestamp?: number;
    daily: IndicatorSet;
    fourHour: IndicatorSet;
    weekly: IndicatorSet;
};

type SortKey = 'pair' | 'price' | 'change' | 'timestamp';

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

  const processedData = React.useMemo((): ProcessedData[] => {
    return data.map(item => {
      const quote = item.quote?.[0];
      return {
        pair: item.pair,
        price: quote?.bid,
        change: quote?.changes,
        timestamp: quote?.timestamp,
        daily: item.indicators.daily,
        fourHour: item.indicators.fourHour,
        weekly: item.indicators.weekly,
      };
    });
  }, [data]);

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

  const IndicatorCell = ({ indicatorSet, field, toFixed = 2 }: { indicatorSet: IndicatorSet, field: keyof IndicatorSet, toFixed?: number }) => {
    const value = indicatorSet[field];
    if (field === 'macd' && typeof value === 'object' && value !== null) {
      return (
        <TableCell>
          <div>H: {formatValue(value.histogram, 5)}</div>
          <div>M: {formatValue(value.macd, 5)}</div>
        </TableCell>
      );
    }
     if (field === 'stochastic' && typeof value === 'object' && value !== null) {
      return (
        <TableCell>
          <div>K: {formatValue(value.k, toFixed)}</div>
          <div>D: {formatValue(value.d, toFixed)}</div>
        </TableCell>
      );
    }
    return <TableCell>{formatValue(value, toFixed)}</TableCell>;
  };

  return (
      <ScrollArea className="h-[75vh] border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <SortableHeader tkey="pair" label="Pair" />
              <SortableHeader tkey="price" label="Price" />
              <SortableHeader tkey="change" label="Change" />
              <SortableHeader tkey="timestamp" label="Last Update" />
              <TableHead>EMA (50) 1D</TableHead>
              <TableHead>EMA (50) 4H</TableHead>
              <TableHead>EMA (50) 1W</TableHead>
              <TableHead>ADX (14) 1D</TableHead>
              <TableHead>RSI (14) 1D</TableHead>
              <TableHead>MACD 1D</TableHead>
              <TableHead>ATR (14) 1D</TableHead>
              <TableHead>Stoch (14,3) 1D</TableHead>
              <TableHead>SAR 1D</TableHead>
              <TableHead>CCI (20) 1D</TableHead>
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
                <TableCell>{formatTimestamp(item.timestamp)}</TableCell>
                <IndicatorCell indicatorSet={item.daily} field="ema50" toFixed={5} />
                <IndicatorCell indicatorSet={item.fourHour} field="ema50" toFixed={5} />
                <IndicatorCell indicatorSet={item.weekly} field="ema50" toFixed={5} />
                <IndicatorCell indicatorSet={item.daily} field="adx" />
                <IndicatorCell indicatorSet={item.daily} field="rsi" />
                <IndicatorCell indicatorSet={item.daily} field="macd" />
                <IndicatorCell indicatorSet={item.daily} field="atr" toFixed={5} />
                <IndicatorCell indicatorSet={item.daily} field="stochastic" />
                <IndicatorCell indicatorSet={item.daily} field="sar" toFixed={5} />
                <IndicatorCell indicatorSet={item.daily} field="cci" />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
  );
}
