
'use client';

import * as React from 'react';
import MarketOpportunities from '@/components/autobot/market-opportunities';
import { Scan, PlayCircle, Loader2 } from 'lucide-react';
import AutoBotStrategyForm from '@/components/autobot/autobot-strategy-form';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function AutoBotPage() {
  const { dScoreData, strategy, isLoading: isDataLoading } = useData();
  const [isScanning, setIsScanning] = React.useState(false);
  const { toast } = useToast();
  
  const [localStrategy, setLocalStrategy] = React.useState(strategy);

  React.useEffect(() => {
    setLocalStrategy(strategy);
  }, [strategy]);

  const handleScanNow = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/autobot/scan', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Scan failed');
      }
      toast({
        title: "Scan Complete",
        description: result.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: (error as Error).message,
      });
    } finally {
      setIsScanning(false);
    }
  };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Scan className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-semibold font-headline">Auto Bot Strategy</h1>
                <p className="text-muted-foreground">Configure your D-Score based automated trading scanner.</p>
            </div>
        </div>
        <button
          onClick={handleScanNow}
          disabled={isScanning || isDataLoading}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isScanning ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <PlayCircle className="h-5 w-5" />
          )}
          {isScanning ? 'Scanning...' : 'Run Scan Now'}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 flex flex-col gap-8">
            {isDataLoading || !localStrategy ? (
                 <Skeleton className="h-[800px] w-full" />
            ) : (
                <AutoBotStrategyForm initialStrategy={localStrategy} />
            )}
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
            <MarketOpportunities 
                opportunities={dScoreData} 
                includedPairs={localStrategy?.includedPairs ?? {}}
                onInclusionChange={(pair, included) => {
                    setLocalStrategy(prev => prev ? ({ ...prev, includedPairs: { ...prev.includedPairs, [pair]: included } }) : null);
                }}
            />
        </div>
      </div>
    </main>
  );
}
