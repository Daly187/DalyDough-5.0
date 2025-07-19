
'use client';

import * as React from 'react';
import MarketOverviewTable from '@/components/dashboard/market-overview-table';
import SystemStatus from '@/components/dashboard/system-status';
import { botConfigurationData, aiReentriesData, pairs } from '@/lib/data';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import BotConfiguration from '@/components/autobot/bot-configuration';
import { Rocket } from 'lucide-react';
import { getForexData } from '@/lib/fmp';
import type { DScore, Bot } from '@/lib/types';
import MarketControls from '@/components/dashboard/market-controls';
import { Skeleton } from '@/components/ui/skeleton';
import AiOptimizedReentries from '@/components/autobot/ai-optimized-reentries';
import { useRefresh } from '@/context/refresh-context';
import { getBots } from '@/app/actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';

export default function DashboardPage() {
  const [allDScoreData, setAllDScoreData] = React.useState<DScore[]>([]);
  const [activeBots, setActiveBots] = React.useState<Bot[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dScoreThresholds, setDScoreThresholds] = React.useState({ lower: -7.0, upper: 7.0 });
  const { refreshKey } = useRefresh();
  const [user, authLoading] = useAuthState(auth);

  React.useEffect(() => {
    async function fetchData() {
      if (!user && !authLoading) {
        // User is not logged in, maybe redirect or show a message.
        setIsLoading(false);
        return;
      }

      if (user) {
          setIsLoading(true);
          const dScorePromise = Promise.all(
            pairs.map(p => getForexData(p) as unknown as Promise<DScore>)
          );
          
          const botsPromise = getBots(user.uid);

          const [calculatedScores, botsResult] = await Promise.all([dScorePromise, botsPromise]);

          setAllDScoreData(calculatedScores);
          
          if (botsResult.success && botsResult.data) {
            const allBots = botsResult.data as Bot[];
            setActiveBots(allBots.filter(b => b.status !== 'closed'));
          } else if (!botsResult.success) {
            console.error("Failed to fetch bots:", botsResult.error);
          }

          setIsLoading(false);
      }
    }
    fetchData();
  }, [refreshKey, user, authLoading]);

  const filteredDScoreData = React.useMemo(() => {
    return allDScoreData.filter(p => p.dScore <= dScoreThresholds.lower || p.dScore >= dScoreThresholds.upper);
  }, [allDScoreData, dScoreThresholds]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <SystemStatus />
      
      {isLoading ? (
        <Skeleton className="h-[158px] w-full rounded-lg" />
      ) : (
        <MarketControls thresholds={dScoreThresholds} onThresholdChange={setDScoreThresholds} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <MarketOverviewTable data={filteredDScoreData} isLoading={isLoading} />
          <ActiveBotsTable data={activeBots.slice(0, 4)} allPairs={allDScoreData} title="Active Bots" description="A real-time overview of all currently running trade bots." />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <Rocket className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-semibold font-headline">Manual Bot Launcher</h1>
                    <p className="text-muted-foreground">Configure and launch a new bot manually.</p>
                </div>
            </div>
            <BotConfiguration config={botConfigurationData} allPairs={filteredDScoreData} activeBots={activeBots} isLoading={isLoading} />
            <AiOptimizedReentries reentries={aiReentriesData} />
        </div>
      </div>
    </main>
  );
}
