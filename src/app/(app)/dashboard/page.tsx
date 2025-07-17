
'use client';

import * as React from 'react';
import MarketOverviewTable from '@/components/dashboard/market-overview-table';
import SystemStatus from '@/components/dashboard/system-status';
import { activeBotsData, botConfigurationData, aiReentriesData, calculateDScore, pairs } from '@/lib/data';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import BotConfiguration from '@/components/autobot/bot-configuration';
import AiOptimizedReentries from '@/components/autobot/ai-optimized-reentries';
import { Rocket } from 'lucide-react';
import { getForexData } from '@/lib/fmp';
import type { DScore } from '@/lib/types';
import MarketControls from '@/components/dashboard/market-controls';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [dScoreData, setDScoreData] = React.useState<DScore[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dScoreThreshold, setDScoreThreshold] = React.useState(7.0);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const forexData = await getForexData(pairs);
      const calculatedScores: DScore[] = await Promise.all(
        forexData.map((data, index) => calculateDScore(data, index))
      );
      setDScoreData(calculatedScores);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const filteredDScoreData = React.useMemo(() => {
    return dScoreData.filter(p => p.dScore >= dScoreThreshold);
  }, [dScoreData, dScoreThreshold]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <SystemStatus />
      
      {isLoading ? (
        <Skeleton className="h-[158px] w-full rounded-lg" />
      ) : (
        <MarketControls threshold={dScoreThreshold} onThresholdChange={setDScoreThreshold} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <MarketOverviewTable data={filteredDScoreData} isLoading={isLoading} />
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
            <BotConfiguration config={botConfigurationData} allPairs={filteredDScoreData} activeBots={activeBotsData} isLoading={isLoading} />
            <AiOptimizedReentries reentries={aiReentriesData} />
        </div>
      </div>
    </main>
  );
}
