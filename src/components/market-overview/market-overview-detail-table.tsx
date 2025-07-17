
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

interface MarketOverviewDetailTableProps {
  data: DScore[];
}

type SortKey = keyof DScore;

export default function MarketOverviewDetailTable({ data }: MarketOverviewDetailTableProps) {
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
      <Button variant="ghost" onClick={() => handleSort(tkey)} className="px-2 hover:bg-transparent">
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
      <ScrollArea className="h-[600px] border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <SortableHeader tkey="pair" label="Pair" />
              <SortableHeader tkey="dScore" label="D-Score" />
              <SortableHeader tkey="adxStrength" label="ADX" />
              <SortableHeader tkey="bollingerBandVolatility" label="BB Vol" />
              <SortableHeader tkey="trendAlignment" label="Trend" />
              <SortableHeader tkey="srRetest" label="S/R" />
              <SortableHeader tkey="priceStructure" label="Structure" />
              <SortableHeader tkey="marketRegimeFit" label="Regime" />
              <SortableHeader tkey="currencyStrengthIndex" label="CSI" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.pair}</TableCell>
                <TableCell className="font-semibold text-lg text-primary">{item.dScore.toFixed(1)}</TableCell>
                <TableCell>{item.adxStrength.toFixed(1)}</TableCell>
                <TableCell>{item.bollingerBandVolatility.toFixed(1)}</TableCell>
                <TableCell>{item.trendAlignment.toFixed(1)}</TableCell>
                <TableCell>{item.srRetest.toFixed(1)}</TableCell>
                <TableCell>{item.priceStructure.toFixed(1)}</TableCell>
                <TableCell>{item.marketRegimeFit.toFixed(1)}</TableCell>
                <TableCell>{item.currencyStrengthIndex.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
  );
}
