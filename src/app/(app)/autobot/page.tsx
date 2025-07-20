

import AutoBotConfiguration from '@/components/autobot/autobot-configuration';
import MarketOpportunities from '@/components/autobot/market-opportunities';
import { pairs } from '@/lib/data';
import { getForexData } from '@/lib/fmp';
import type { DScore } from '@/lib/types';
import { Scan } from 'lucide-react';

export default async function AutoBotPage() {
  const dScoreData: DScore[] = await Promise.all(
    pairs.map(p => getForexData(p) as unknown as Promise<DScore>)
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Scan className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-2xl font-semibold font-headline">Auto Bot Strategy</h1>
            <p className="text-muted-foreground">Configure your D-Score based automated trading scanner.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
            <AutoBotConfiguration />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
            <MarketOpportunities opportunities={dScoreData} />
        </div>
      </div>
    </main>
  );
}
