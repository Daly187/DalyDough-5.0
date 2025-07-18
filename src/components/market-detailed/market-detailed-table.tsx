
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
import type { DScore } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MarketDetailedTableProps {
  data: DScore[];
}

type SortKey = keyof DScore['rawIndicators'] | 'pair' | 'price' | 'change' | 'lastUpdated';

const formatValue = (value: any, fixed: number = 2) => {
    if (typeof value === 'number') {
        return value.toFixed(fixed);
    }
    if (typeof value === 'object' && value !== null && value.histogram !== undefined) {
        return value.histogram.toFixed(4);
    }
    if (typeof value === 'object' && value !== null && value.k !== undefined) {
        return value.k.toFixed(2);
    }
     if (typeof value === 'object' && value !== null && value.middle !== undefined) {
        return value.middle.toFixed(4);
    }
    return value ?? 'N/A';
};

const formatTimestamp = (timestamp?: any) => {
    if (typeof timestamp === 'number' && timestamp > 0) {
        return format(new Date(timestamp * 1000), "yyyy-MM-dd HH:mm:ss");
    }
    return 'N/A';
};

export default function MarketDetailedTable({ data }: MarketDetailedTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('pair');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (['pair', 'price', 'change', 'lastUpdated'].includes(sortKey)) {
        aValue = a[sortKey as keyof Omit<DScore, 'rawIndicators' | 'rawIndicators'>];
        bValue = b[sortKey as keyof Omit<DScore, 'rawIndicators' | 'rawIndicators'>];
      } else {
        aValue = a.rawIndicators?.[sortKey as keyof DScore['rawIndicators']];
        bValue = b.rawIndicators?.[sortKey as keyof DScore['rawIndicators']];
      }
      
      // Handle nested MACD object
      if (sortKey === 'macd' && typeof aValue === 'object' && aValue !== null) aValue = aValue.histogram;
      if (sortKey === 'macd' && typeof bValue === 'object' && bValue !== null) bValue = bValue.histogram;
      if (sortKey === 'stochastic' && typeof aValue === 'object' && aValue !== null) aValue = aValue.k;
      if (sortKey === 'stochastic' && typeof bValue === 'object' && bValue !== null) bValue = bValue.k;


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
              <SortableHeader tkey="ema20" label="EMA 20" />
              <SortableHeader tkey="ema50" label="EMA 50" />
              <SortableHeader tkey="ema100" label="EMA 100" />
              <SortableHeader tkey="adx" label="ADX" />
              <SortableHeader tkey="macd" label="MACD Hist" />
              <SortableHeader tkey="atr" label="ATR" />
              <SortableHeader tkey="stochastic" label="Stoch" />
              <SortableHeader tkey="sar" label="SAR" />
              <SortableHeader tkey="cci" label="CCI" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => {
                const indicators = item.rawIndicators;
                if (!indicators) return null;
                return (
                    <TableRow key={item.pair}>
                        <TableCell className="font-medium">{item.pair}</TableCell>
                        <TableCell className="font-semibold text-primary">{formatValue(item.price, 5)}</TableCell>
                        <TableCell className={cn(item.change >= 0 ? 'text-green-400' : 'text-red-400')}>
                            {formatValue(item.change, 4)} ({formatValue(item.changesPercentage, 2)}%)
                        </TableCell>
                        <TableCell>{formatTimestamp(item.lastUpdated)}</TableCell>
                        <TableCell>{formatValue(indicators.ema20, 4)}</TableCell>
                        <TableCell>{formatValue(indicators.ema50, 4)}</TableCell>
                        <TableCell>{formatValue(indicators.ema100, 4)}</TableCell>
                        <TableCell>{formatValue(indicators.adx, 2)}</TableCell>
                        <TableCell>{formatValue(indicators.macd, 4)}</TableCell>
                        <TableCell>{formatValue(indicators.atr, 5)}</TableCell>
                        <TableCell>{formatValue(indicators.stochastic, 2)}</TableCell>
                        <TableCell>{formatValue(indicators.sar, 4)}</TableCell>
                        <TableCell>{formatValue(indicators.cci, 2)}</TableCell>
                    </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </ScrollArea>
  );
}
