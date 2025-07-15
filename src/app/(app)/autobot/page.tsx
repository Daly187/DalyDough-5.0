import MarketFilter from '@/components/autobot/market-filter';
import MarketOpportunities from '@/components/autobot/market-opportunities';
import BotConfiguration from '@/components/autobot/bot-configuration';
import AiOptimizedReentries from '@/components/autobot/ai-optimized-reentries';
import { dScoreData, botConfigurationData, aiReentriesData, activeBotsData } from '@/lib/data';
import { Rocket } from 'lucide-react';

export default function AutoBotPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Rocket className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-2xl font-semibold font-headline">Launch New Bot</h1>
            <p className="text-muted-foreground">Advanced D-Size powered bot configuration</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
            <MarketFilter />
            <MarketOpportunities opportunities={dScoreData.slice(0, 9)} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
            <BotConfiguration config={botConfigurationData} allPairs={dScoreData} activeBots={activeBotsData} />
            <AiOptimizedReentries reentries={aiReentriesData} />
        </div>
      </div>
    </main>
  );
}
