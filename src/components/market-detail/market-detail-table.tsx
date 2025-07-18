
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
import type { ForexData } from '@/lib/types';
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
    adx?: number;
    pdi?: number;
    mdi?: number;
    atr?: number;
    bb_upper?: number;
    bb_middle?: number;
    bb_lower?: number;
    sma50d?: number;
    sma100d?: number;
    sma200d?: number;
    sma50w?: number;
};

type SortKey = keyof ProcessedData;

const formatValue = (value: any, fixed: number = 2) => {
    if (typeof value === 'number') {
        return value.toFixed(fixed);
    }
    return 'N/A';
}

const formatTimestamp = (timestamp: any) => {
    if (typeof timestamp === 'number') {
        return new Date(timestamp * 1000).toLocaleString();
    }
    return 'N/A';
}

export default function MarketDetailTable({ data }: MarketDetailTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('pair');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const processedData = React.useMemo((): ProcessedData[] => {
    return data.map(item => {
      const quote = item.quote?.[0];
      const adx = item.adx?.[0];
      const atr = item.atr?.[0];
      const bb = item.bb?.[0];
      const sma50d = item.sma50?.[0];
      const sma100d = item.sma100?.[0];
      const sma200d = item.sma200?.[0];
      const sma50w = item.sma50_weekly?.[0];
      
      return {
        pair: item.pair,
        price: quote?.price,
        change: quote?.changesPercentage,
        timestamp: quote?.timestamp,
        adx: adx?.adx,
        pdi: adx?.pdi,
        mdi: adx?.mdi,
        atr: atr?.atr,
        bb_upper: bb?.upperBand,
        bb_middle: bb?.middleBand,
        bb_lower: bb?.lowerBand,
        sma50d: sma50d?.sma,
        sma100d: sma100d?.sma,
        sma200d: sma200d?.sma,
        sma50w: sma50w?.sma,
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
      setSortKey(key);
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
              <SortableHeader tkey="change" label="Change %" />
              <SortableHeader tkey="timestamp" label="Last Update" />
              <SortableHeader tkey="adx" label="ADX" />
              <SortableHeader tkey="atr" label="ATR" />
              <SortableHeader tkey="sma50d" label="SMA 50D" />
              <SortableHeader tkey="sma100d" label="SMA 100D" />
              <SortableHeader tkey="sma200d" label="SMA 200D" />
              <SortableHeader tkey="sma50w" label="SMA 50W" />
              <SortableHeader tkey="bb_upper" label="BB Upper" />
              <SortableHeader tkey="bb_middle" label="BB Middle" />
              <SortableHeader tkey="bb_lower" label="BB Lower" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.pair}>
                <TableCell className="font-medium">{item.pair}</TableCell>
                <TableCell className="font-semibold text-primary">{formatValue(item.price, 5)}</TableCell>
                <TableCell className={cn(item.change && item.change >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {formatValue(item.change)}%
                </TableCell>
                <TableCell>{formatTimestamp(item.timestamp)}</TableCell>
                <TableCell>{formatValue(item.adx)}</TableCell>
                <TableCell>{formatValue(item.atr, 5)}</TableCell>
                <TableCell>{formatValue(item.sma50d, 5)}</TableCell>
                <TableCell>{formatValue(item.sma100d, 5)}</TableCell>
                <TableCell>{formatValue(item.sma200d, 5)}</TableCell>
                <TableCell>{formatValue(item.sma50w, 5)}</TableCell>
                <TableCell>{formatValue(item.bb_upper, 5)}</TableCell>
                <TableCell>{formatValue(item.bb_middle, 5)}</TableCell>
                <TableCell>{formatValue(item.bb_lower, 5)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
  );
}
