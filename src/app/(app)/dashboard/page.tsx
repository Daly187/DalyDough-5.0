
import * as React from 'react';
import MarketOverviewTable from '@/components/dashboard/market-overview-table';
import SystemStatus from '@/components/dashboard/system-status';
import { activeBotsData, botConfigurationData, aiReentriesData, calculateDScore, pairs as defaultPairs, calculateLiveCurrencyStrength } from '@/lib/data';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import BotConfiguration from '@/components/autobot/bot-configuration';
import AiOptimizedReentries from '@/components/autobot/ai-optimized-reentries';
import { Rocket } from 'lucide-react';
import { getForexData } from '@/lib/fmp';
import type { DScore, DScoreWeights } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Note: We are making this a server component for more reliable data fetching.
// The 'use client' components will still work inside it.

export default async function DashboardPage() {
  
  // This logic now runs on the server before the page is sent to the client.
  const forexData = await getForexData(defaultPairs);

  if (!forexData || forexData.length === 0) {
      return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">Failed to load market data. The API might be temporarily unavailable or the API key is invalid. Please check the console for more details.</p>
                </CardContent>
            </Card>
        </main>
      )
  }

  const liveStrengthData = calculateLiveCurrencyStrength(forexData);
  
  // We pass null for weights, so it uses the defaults. The settings page handles custom weights via localStorage on the client.
  const dScoreData: DScore[] = forexData
    .map((data, index) => calculateDScore(data, index, liveStrengthData, null))
    .filter((d): d is DScore => d !== null);


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
