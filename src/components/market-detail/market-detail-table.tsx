
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

type SortKey = 'pair' | 'price' | 'adx' | 'bbw';

const formatValue = (value: any, fixed: number = 2) => {
    if (typeof value === 'number') {
        return value.toFixed(fixed);
    }
    return 'N/A';
}


export default function MarketDetailTable({ data }: MarketDetailTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('pair');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const processedData = React.useMemo(() => {
    return data.map(item => {
      const quote = item.quote?.[0];
      const bb = item.bb?.[0];
      const adx = item.adx?.[0];
      
      let bbw = null;
      if (bb && bb.middleBand > 0) {
        bbw = ((bb.upperBand - bb.lowerBand) / bb.middleBand) * 100;
      }
      
      return {
        pair: item.pair,
        price: quote?.price,
        adx: adx?.adx,
        bb_upper: bb?.upperBand,
        bb_middle: bb?.middleBand,
        bb_lower: bb?.lowerBand,
        bbw: bbw, // Bollinger Band Width in %
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
              <SortableHeader tkey="adx" label="ADX" />
              <SortableHeader tkey="bbw" label="BB Width (%)" />
              <TableHead>BB Upper</TableHead>
              <TableHead>BB Middle</TableHead>
              <TableHead>BB Lower</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.pair}>
                <TableCell className="font-medium">{item.pair}</TableCell>
                <TableCell className="font-semibold text-primary">{formatValue(item.price, 5)}</TableCell>
                <TableCell>{formatValue(item.adx)}</TableCell>
                <TableCell className={cn(item.bbw && item.bbw > 4 && "text-yellow-400", item.bbw && item.bbw < 0.5 && "text-yellow-400")}>
                    {formatValue(item.bbw, 3)}
                </TableCell>
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
