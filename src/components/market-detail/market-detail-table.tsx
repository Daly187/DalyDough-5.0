

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
    ema50_4h?: number;
    ema50d?: number;
    ema50_w?: number;
    adx?: number;
    rsi?: number;
    macd?: number;
    macd_hist?: number;
    atr?: number;
    bb_upper?: number;
    bb_lower?: number;
    stoch_k?: number;
    stoch_d?: number;
    sar?: number;
    cci?: number;
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
      return {
        pair: item.pair,
        price: quote?.bid,
        change: quote?.changes,
        timestamp: quote?.timestamp,
        ema50_4h: item.ema50_4h?.[0]?.ema,
        ema50d: item.ema50d?.[0]?.ema,
        ema50_w: item.ema50_w?.[0]?.ema,
        adx: item.adx?.[0]?.adx,
        rsi: item.rsi?.[0]?.rsi,
        macd: item.macd?.[0]?.macd,
        macd_hist: item.macd?.[0]?.histogram,
        atr: item.atr?.[0]?.atr,
        bb_upper: item.bb?.[0]?.upperBand,
        bb_lower: item.bb?.[0]?.lowerBand,
        stoch_k: item.stochastic?.[0]?.k,
        stoch_d: item.stochastic?.[0]?.d,
        sar: item.sar?.[0]?.sar,
        cci: item.cci?.[0]?.cci,
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
              <SortableHeader tkey="change" label="Change" />
              <SortableHeader tkey="timestamp" label="Last Update" />
              <SortableHeader tkey="ema50_4h" label="EMA 4H" />
              <SortableHeader tkey="ema50d" label="EMA 1D" />
              <SortableHeader tkey="ema50_w" label="EMA 1W" />
              <SortableHeader tkey="adx" label="ADX" />
              <SortableHeader tkey="rsi" label="RSI" />
              <SortableHeader tkey="macd" label="MACD" />
              <SortableHeader tkey="macd_hist" label="MACD Hist" />
              <SortableHeader tkey="atr" label="ATR" />
              <SortableHeader tkey="bb_upper" label="BB Upper" />
              <SortableHeader tkey="bb_lower" label="BB Lower" />
              <SortableHeader tkey="stoch_k" label="Stoch %K" />
              <SortableHeader tkey="stoch_d" label="Stoch %D" />
              <SortableHeader tkey="sar" label="SAR" />
              <SortableHeader tkey="cci" label="CCI" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.pair}>
                <TableCell className="font-medium">{item.pair}</TableCell>
                <TableCell className="font-semibold text-primary">{formatValue(item.price, 5)}</TableCell>
                <TableCell className={cn(item.change && item.change >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {formatValue(item.change)}
                </TableCell>
                <TableCell>{formatTimestamp(item.timestamp)}</TableCell>
                <TableCell>{formatValue(item.ema50_4h, 5)}</TableCell>
                <TableCell>{formatValue(item.ema50d, 5)}</TableCell>
                <TableCell>{formatValue(item.ema50_w, 5)}</TableCell>
                <TableCell>{formatValue(item.adx)}</TableCell>
                <TableCell>{formatValue(item.rsi)}</TableCell>
                <TableCell>{formatValue(item.macd, 5)}</TableCell>
                <TableCell>{formatValue(item.macd_hist, 5)}</TableCell>
                <TableCell>{formatValue(item.atr, 5)}</TableCell>
                <TableCell>{formatValue(item.bb_upper, 5)}</TableCell>
                <TableCell>{formatValue(item.bb_lower, 5)}</TableCell>
                <TableCell>{formatValue(item.stoch_k)}</TableCell>
                <TableCell>{formatValue(item.stoch_d)}</TableCell>
                <TableCell>{formatValue(item.sar, 5)}</TableCell>
                <TableCell>{formatValue(item.cci)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
  );
}
