

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
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronsUpDown } from 'lucide-react';
import type { DScore } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface MarketOverviewTableProps {
  data: DScore[];
}

type SortKey = keyof DScore | 'pair' | 'dScore';

const signalConfig = {
    Buy: { color: "text-green-400", icon: <ArrowUp className="h-4 w-4" />, label: "Allow Buy" },
    Sell: { color: "text-red-400", icon: <ArrowDown className="h-4 w-4" />, label: "Allow Sell" },
    Block: { color: "text-muted-foreground", icon: <div className="h-4 w-4 flex items-center justify-center">-</div>, label: "Block" },
}

const TrendIndicator = ({ trend }: { trend: 'buy' | 'sell' }) => (
    trend === 'buy'
        ? <ArrowUp className="h-4 w-4 text-green-400" />
        : <ArrowDown className="h-4 w-4 text-red-400" />
);

const getBreakdownText = (key: keyof DScore, score: number, trendDirection: 'Buy' | 'Sell' | 'Block') => {
    if (trendDirection === 'Block') return 'Neutral';
    const trendText = trendDirection === 'Buy' ? 'Buy' : 'Sell';
    
    switch (key) {
        case 'trendAlignment':
            if (score >= 1.5) return `Confirms ${trendText} Trend`;
            if (score > 0) return `Weak ${trendText} Agreement`;
            return 'No Trend Agreement';
        case 'adxStrength':
            if (score >= 0.7) return 'Strong Trend Momentum';
            if (score > 0) return 'Developing Momentum';
            return 'Weak Momentum';
        case 'maConvergence':
            if (score >= 1.0) return `Confirms ${trendText} Momentum`;
            if (score > 0) return 'Partial Agreement';
            return 'Divergent MAs';
        case 'srRetest':
            if (score > 0) return `Confirms ${trendText} at Key Level`;
            return 'Not at a Key Level';
        case 'priceStructure':
            if (score >= 0.7) return `Clear ${trendText} Structure`;
            if (score > 0) return 'Developing Structure';
            return 'Unclear Structure';
        case 'atrVolatility':
             if (score >= 0.7) return 'Ideal Volatility';
            if (score > 0) return 'Moderate Volatility';
            return 'Low Volatility';
        case 'marketRegimeFit':
            if (score >= 1.0) return `Ideal for ${trendText}ing`;
            if (score > 0) return 'Moderate Fit';
            return 'Poor Fit for Trending';
        case 'currencyStrength':
            if (score >= 0.7) return `Strong ${trendText} Confirmation`;
            if (score > 0) return 'Moderate Confirmation';
            return 'No Confirmation';
        default:
            return 'Neutral';
    }
}


export default function MarketOverviewTable({ data }: MarketOverviewTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('dScore');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [openRow, setOpenRow] = React.useState<string | null>(null);


  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortKey as keyof DScore];
      const bValue = b[sortKey as keyof DScore];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue);
      const bStr = String(bValue);

      if (aStr < bStr) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aStr > bStr) {
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
  
  const scoreKeys: (keyof DScore)[] = [
    'trendAlignment', 'adxStrength', 'maConvergence', 'srRetest', 
    'priceStructure', 'atrVolatility', 'marketRegimeFit', 'currencyStrength'
  ];
  
  const maxScores: Record<keyof DScore, number> = {
      trendAlignment: 2.0, adxStrength: 1.0, maConvergence: 1.5, srRetest: 0.5,
      priceStructure: 1.0, atrVolatility: 0.5, marketRegimeFit: 2.0, currencyStrength: 1.5,
      id: 0, pair: 0, price: 0, change: 0, changesPercentage: 0, dScore: 10, grade: 0, signal: 0, positions: 0, trends: 0
  };

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
                <TableHead>Trend (1d/1w)</TableHead>
                <SortableHeader tkey="trendAlignment" label="Trend Score" />
                <SortableHeader tkey="adxStrength" label="ADX" />
                <TableHead className="text-right">Entry Signal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => {
                if (!item) return null; // Add a guard clause for null items
                const signal = signalConfig[item.signal];
                const isRowOpen = openRow === item.id;
                return (
                   <React.Fragment key={item.id}>
                      <TableRow 
                        onClick={() => setOpenRow(isRowOpen ? null : item.id)} 
                        className="cursor-pointer"
                        data-state={isRowOpen ? 'open' : 'closed'}
                      >
                        <TableCell>
                          <div className="font-medium">{item.pair}</div>
                          <div className={cn("text-xs", item.change >= 0 ? 'text-green-400' : 'text-red-400')}>
                            {item.price.toFixed(item.pair.includes('JPY') ? 3 : 5)}
                            <span className="ml-1">({item.changesPercentage.toFixed(2)}%)</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-lg text-primary">{item.dScore.toFixed(1)}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
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
                      {isRowOpen && (
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableCell colSpan={6} className="p-0">
                                <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-2">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 text-foreground">D-Score Breakdown</h4>
                                        <div className="space-y-1 text-xs">
                                          {scoreKeys.map(key => (
                                            <div key={key} className="flex justify-between">
                                                <span className="text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> 
                                                <span className="font-semibold text-foreground">{getBreakdownText(key, item[key] as number, item.signal)}</span>
                                            </div>
                                          ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 text-foreground">Point Allocation</h4>
                                        <div className="space-y-1 text-xs">
                                          {scoreKeys.map(key => (
                                              <div key={key} className="flex justify-between">
                                                <span className="text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> 
                                                <span className="font-semibold text-foreground">{(item[key] as number).toFixed(2)} / {maxScores[key].toFixed(2)}</span>
                                              </div>
                                          ))}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                      )}
                   </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
