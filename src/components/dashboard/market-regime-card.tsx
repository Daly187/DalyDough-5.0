"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getMarketRegimeSummary } from '@/app/actions';
import type { MarketRegime } from '@/lib/types';
import { TrendingUp, ArrowRightLeft, Zap, ThermometerSnowflake } from 'lucide-react';
import { cn } from '@/lib/utils';


interface MarketRegimeCardProps {
  data: MarketRegime;
}

const regimeIcons = {
  Trending: <TrendingUp className="h-4 w-4" />,
  Ranging: <ArrowRightLeft className="h-4 w-4" />,
  Volatile: <Zap className="h-4 w-4" />,
  Dead: <ThermometerSnowflake className="h-4 w-4" />,
};

const regimeColors = {
  Trending: 'bg-green-500/20 text-green-400 border-green-500/30',
  Ranging: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Volatile: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Dead: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};


export default function MarketRegimeCard({ data }: MarketRegimeCardProps) {
  const [summary, setSummary] = React.useState<{ regime: keyof typeof regimeIcons; summary: string } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      const result = await getMarketRegimeSummary(data);
      if (result.success && result.data) {
        setSummary(result.data as { regime: keyof typeof regimeIcons; summary: string });
      }
      setIsLoading(false);
    };
    fetchSummary();
  }, [data]);

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium font-headline">Market Regime: {data.currencyPair}</CardTitle>
        {isLoading ? (
          <Skeleton className="h-6 w-20 rounded-full" />
        ) : (
          summary && (
            <Badge variant="outline" className={cn("flex items-center gap-1.5", regimeColors[summary.regime])}>
              {regimeIcons[summary.regime]}
              {summary.regime}
            </Badge>
          )
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 mt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
            <>
                <div className="text-2xl font-bold text-primary">{data.price.toFixed(4)}</div>
                <p className="text-xs text-muted-foreground">{summary?.summary}</p>
            </>
        )}
      </CardContent>
    </Card>
  );
}
