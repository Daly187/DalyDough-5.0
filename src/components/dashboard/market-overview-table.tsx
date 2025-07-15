
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
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { DScore } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MarketOverviewTableProps {
  data: DScore[];
}

type SortKey = keyof DScore;

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
    const trendText = trendDirection === 'Buy' ? 'Buy' : 'Sell';
    switch (key) {
        case 'trendAlignment':
            if (score > 1.5) return `Confirms ${trendText} Trend`;
            if (score > 0.5) return `Weak ${trendText} Agreement`;
            return 'No Trend Agreement';
        case 'adxStrength':
            if (score > 0.7) return 'Strong Trend Momentum';
            if (score > 0.4) return 'Developing Momentum';
            return 'Weak Momentum';
        case 'maConvergence':
            if (score > 1.0) return `Confirms ${trendText} Momentum`;
            if (score > 0.5) return 'Partial Agreement';
            return 'Divergent MAs';
        case 'srRetest':
            if (score > 1.0) return 'Retesting Key Level';
            return 'Not at a Key Level';
        case 'priceStructure':
            if (score > 0.7) return `Clear ${trendText} Structure`;
            if (score > 0.4) return 'Developing Structure';
            return 'Unclear Structure';
        case 'atrVolatility':
            if (score > 0.7) return 'High Volatility';
            if (score > 0.4) return 'Moderate Volatility';
            return 'Low Volatility';
        case 'marketRegimeFit':
            if (score > 1.5) return `Ideal for ${trendText}ing`;
            if (score > 0.5) return 'Moderate Fit';
            return 'Poor Fit for Trending';
        case 'currencyStrength':
            if (score > 0.7) return `Strong ${trendText} Confirmation`;
            if (score > 0.4) return 'Moderate Confirmation';
            return 'No Confirmation';
        default:
            return '';
    }
}


export default function MarketOverviewTable({ data }: MarketOverviewTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('dScore');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [openRow, setOpenRow] = React.useState<string | null>(null);


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
      <Button variant="ghost" onClick={() => handleSort(tkey)} className="px-0 hover:bg-transparent">
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

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
                const signal = signalConfig[item.signal];
                return (
                  <Collapsible asChild key={item.id} open={openRow === item.id} onOpenChange={() => setOpenRow(openRow === item.id ? null : item.id)}>
                      <React.Fragment>
                        <CollapsibleTrigger asChild>
                          <TableRow className="cursor-pointer">
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
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <tr className="bg-muted/50 hover:bg-muted/50">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-2">
                                  <div>
                                      <h4 className="font-semibold text-sm mb-2 text-foreground">D-Score Breakdown</h4>
                                      <div className="space-y-1 text-xs">
                                          <div className="flex justify-between"><span className="text-muted-foreground">Trend Alignment:</span> <span className="font-semibold text-foreground">{getBreakdownText('trendAlignment', item.trendAlignment, item.signal)}</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">ADX Strength:</span> <span className="font-semibold text-foreground">{getBreakdownText('adxStrength', item.adxStrength, item.signal)}</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">MA Convergence:</span> <span className="font-semibold text-foreground">{getBreakdownText('maConvergence', item.maConvergence, item.signal)}</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">S/R Retest:</span> <span className="font-semibold text-foreground">{getBreakdownText('srRetest', item.srRetest, item.signal)}</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">Price Structure:</span> <span className="font-semibold text-foreground">{getBreakdownText('priceStructure', item.priceStructure, item.signal)}</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">ATR/Volatility:</span> <span className="font-semibold text-foreground">{getBreakdownText('atrVolatility', item.atrVolatility, item.signal)}</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">Market Regime Fit:</span> <span className="font-semibold text-foreground">{getBreakdownText('marketRegimeFit', item.marketRegimeFit, item.signal)}</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">Currency Strength:</span> <span className="font-semibold text-foreground">{getBreakdownText('currencyStrength', item.currencyStrength, item.signal)}</span></div>
                                      </div>
                                  </div>
                                  <div>
                                      <h4 className="font-semibold text-sm mb-2 text-foreground">Point Allocation</h4>
                                      <div className="space-y-1 text-xs">
                                          <div className="flex justify-between"><span className="text-muted-foreground">Trend Alignment:</span> <span className="font-semibold text-foreground">{item.trendAlignment.toFixed(2)} / 2.00</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">ADX Strength:</span> <span className="font-semibold text-foreground">{item.adxStrength.toFixed(2)} / 1.00</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">MA Convergence:</span> <span className="font-semibold text-foreground">{item.maConvergence.toFixed(2)} / 1.50</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">S/R Retest:</span> <span className="font-semibold text-foreground">{item.srRetest.toFixed(2)} / 1.50</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">Price Structure:</span> <span className="font-semibold text-foreground">{item.priceStructure.toFixed(2)} / 1.00</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">ATR/Volatility:</span> <span className="font-semibold text-foreground">{item.atrVolatility.toFixed(2)} / 1.00</span></div>
                                          <div className="flex justify-between"><span className="text-muted-foreground">Market Regime Fit:</span> <span className="font-semibold text-foreground">{item.marketRegimeFit.toFixed(2)} / 2.00</span></div>
                                           <div className="flex justify-between"><span className="text-muted-foreground">Currency Strength:</span> <span className="font-semibold text-foreground">{item.currencyStrength.toFixed(2)} / 1.00</span></div>
                                      </div>
                                  </div>
                              </div>
                            </TableCell>
                          </tr>
                        </CollapsibleContent>
                      </React.Fragment>
                  </Collapsible>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
