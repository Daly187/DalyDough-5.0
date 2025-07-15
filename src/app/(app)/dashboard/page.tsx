import MarketOverviewTable from '@/components/dashboard/market-overview-table';
import SystemStatus from '@/components/dashboard/system-status';
import { activeBotsData, botConfigurationData, aiReentriesData, calculateDScore, pairs, calculateLiveCurrencyStrength } from '@/lib/data';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import BotConfiguration from '@/components/autobot/bot-configuration';
import AiOptimizedReentries from '@/components/autobot/ai-optimized-reentries';
import { Rocket } from 'lucide-react';
import { getForexData } from '@/lib/fmp';
import { DScore } from '@/lib/types';


export default async function DashboardPage() {
  const forexData = await getForexData(pairs);
  const liveStrengthData = calculateLiveCurrencyStrength(forexData);

  const dScoreData: DScore[] = forexData.map((data, index) => 
    calculateDScore(data, index, liveStrengthData)
  );

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
