
'use client';

import * as React from 'react';
import MarketOverviewTable from '@/components/dashboard/market-overview-table';
import SystemStatus from '@/components/dashboard/system-status';
import { activeBotsData, botConfigurationData, aiReentriesData, calculateDScore, pairs as defaultPairs, calculateLiveCurrencyStrength } from '@/lib/data';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import BotConfiguration from '@/components/autobot/bot-configuration';
import AiOptimizedReentries from '@/components/autobot/ai-optimized-reentries';
import { Rocket } from 'lucide-react';
import { getForexData } from '@/lib/fmp';
import type { DScore, ForexData, DScoreWeights } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardLoadingSkeleton = () => (
  <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
    <Skeleton className="h-[76px] w-full" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-8">
        <Skeleton className="h-[460px] w-full" />
        <Skeleton className="h-[320px] w-full" />
      </div>
      <div className="lg:col-span-1 flex flex-col gap-8">
        <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
        <Skeleton className="h-[700px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  </div>
);


export default function DashboardPage() {
  const [dScoreData, setDScoreData] = React.useState<DScore[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch user weights from local storage
        const savedWeightsRaw = localStorage.getItem('d_score_weights');
        let weights: DScoreWeights | null = null;
        if (savedWeightsRaw) {
          try {
            weights = JSON.parse(savedWeightsRaw);
          } catch (e) {
            console.error("Failed to parse weights from localStorage", e);
          }
        }
        
        const forexData = await getForexData(defaultPairs);
        if (!forexData) {
            throw new Error("Failed to fetch forex data");
        }
        const liveStrengthData = calculateLiveCurrencyStrength(forexData);

        const calculatedDScoreData: DScore[] = forexData
          .map((data, index) => calculateDScore(data, index, liveStrengthData, weights)) // Pass weights
          .filter(Boolean) as DScore[];
        
        setDScoreData(calculatedDScoreData);
      } catch (e) {
        console.error("Error loading dashboard data:", e);
        setError("Failed to load market data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return <div className="flex justify-center items-center h-full p-8 text-destructive">{error}</div>;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <SystemStatus />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <MarketOverviewTable data={dScoreData} />
          <ActiveBotsTable data={activeBotsData.slice(0, 4)} allPairs={dScoreData} title="Active Bots" description="A real-time overview of all currently running trade bots." />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <Rocket className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-semibold font-headline">Manual Bot Launcher</h1>
                    <p className="text-muted-foreground">Configure and launch a new bot manually.</p>
                </div>
            </div>
            <BotConfiguration config={botConfigurationData} allPairs={dScoreData} activeBots={activeBotsData} />
            <AiOptimizedReentries reentries={aiReentriesData} />
        </div>
      </div>
    </main>
  );
}
