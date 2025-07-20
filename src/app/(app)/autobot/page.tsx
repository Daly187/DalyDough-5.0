
'use client';

import * as React from 'react';
import MarketOpportunities from '@/components/autobot/market-opportunities';
import { botConfigurationData } from '@/lib/data';
import { getForexData } from '@/lib/fmp';
import type { DScore, AutoBotStrategy } from '@/lib/types';
import { Scan, PlayCircle, Loader2 } from 'lucide-react';
import AutoBotStrategyForm from '@/components/autobot/autobot-strategy-form';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';

export default function AutoBotPage() {
  const [dScoreData, setDScoreData] = React.useState<DScore[]>([]);
  const [strategy, setStrategy] = React.useState<AutoBotStrategy | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isScanning, setIsScanning] = React.useState(false);
  const { toast } = useToast();
  const [user] = useAuthState(auth);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);

      // Fetch user's symbol mappings
      const settingsRef = doc(db, 'userSettings', user.uid);
      const settingsSnap = await getDoc(settingsRef);
      let pairs: string[] = [];
      if (settingsSnap.exists() && settingsSnap.data().symbolMappings) {
        pairs = settingsSnap.data().symbolMappings.map((m: { apiSymbol: string }) => m.apiSymbol);
      } else {
        pairs = ['EUR/USD', 'USD/JPY', 'GBP/USD']; // Fallback
      }

      let dScores: DScore[] = [];
      if (pairs.length > 0) {
        dScores = await Promise.all(
          pairs.map(p => getForexData(p) as unknown as Promise<DScore>)
        );
      }
      
      const strategyPromise = fetch('/api/autobot/strategy').then(res => res.json());

      const [strategyRes] = await Promise.all([strategyPromise]);
      
      setDScoreData(dScores.filter(Boolean));
      if (strategyRes.success && strategyRes.data) {
        // Ensure includedPairs is populated for all available pairs
        const currentIncluded = strategyRes.data.includedPairs || {};
        const newIncludedPairs = Object.fromEntries(pairs.map(p => [p, currentIncluded[p] ?? true]));
        setStrategy({ ...strategyRes.data, includedPairs: newIncludedPairs });
      } else {
        // If no strategy is found, use the default config
        setStrategy({ 
          id: 'default', 
          ...botConfigurationData, 
          includedPairs: Object.fromEntries(pairs.map(p => [p, true])),
          entryThresholdLower: -7,
          entryThresholdUpper: 7,
          exitThresholdLower: -6,
          exitThresholdUpper: 6
        });
      }

      setIsLoading(false);
    };
    fetchData();
  }, [user]);

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
          disabled={isScanning || isLoading}
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
            {isLoading || !strategy ? (
                 <div className="lg:col-span-1 flex flex-col gap-8">Loading strategy...</div>
            ) : (
                <AutoBotStrategyForm initialStrategy={strategy} />
            )}
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
            <MarketOpportunities 
                opportunities={dScoreData} 
                includedPairs={strategy?.includedPairs ?? {}}
                onInclusionChange={(pair, included) => {
                    setStrategy(prev => prev ? ({ ...prev, includedPairs: { ...prev.includedPairs, [pair]: included } }) : null);
                }}
            />
        </div>
      </div>
    </main>
  );
}
