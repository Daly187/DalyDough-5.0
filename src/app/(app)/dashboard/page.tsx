
'use client';

import * as React from 'react';
import MarketOverviewTable from '@/components/dashboard/market-overview-table';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import BotConfiguration from '@/components/autobot/bot-configuration';
import { Rocket } from 'lucide-react';
import MarketControls from '@/components/dashboard/market-controls';
import { Skeleton } from '@/components/ui/skeleton';
import AiOptimizedReentries from '@/components/autobot/ai-optimized-reentries';
import { useData } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firestore';


export default function DashboardPage() {
  const { isLoading, dScoreData, activeBots, triggerRefresh } = useData();
  const [dScoreThresholds, setDScoreThresholds] = React.useState({ lower: -7.0, upper: 7.0 });
  const { toast } = useToast();

  const handleCloseAllBots = async () => {
    const botsToClose = activeBots.filter(bot => bot.status !== 'closed');
    
    if (botsToClose.length === 0) {
      toast({ title: 'No active bots to close.' });
      return;
    }

    const batch = writeBatch(db);
    botsToClose.forEach(bot => {
      const botRef = doc(db, 'bots', bot.id);
      batch.update(botRef, { status: 'closed' });
    });

    try {
      await batch.commit();
      toast({
        title: 'Success',
        description: `${botsToClose.length} bot(s) have been closed.`,
      });
      triggerRefresh(); // Refresh data to update UI
    } catch (error) {
      console.error('Failed to close all bots:', error);
      toast({
        variant: 'destructive',
        title: 'Error Closing Bots',
        description: 'Could not update all bot statuses. Please try again.',
      });
    }
  };


  const filteredDScoreData = React.useMemo(() => {
    return dScoreData.filter(p => p.dScore <= dScoreThresholds.lower || p.dScore >= dScoreThresholds.upper);
  }, [dScoreData, dScoreThresholds]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {isLoading ? (
        <Skeleton className="h-[158px] w-full rounded-lg" />
      ) : (
        <MarketControls 
          thresholds={dScoreThresholds} 
          onThresholdChange={setDScoreThresholds}
          onCloseAll={handleCloseAllBots}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <MarketOverviewTable data={filteredDScoreData} isLoading={isLoading} />
          <ActiveBotsTable data={activeBots.slice(0, 4)} allPairs={dScoreData} title="Active Bots" description="A real-time overview of all currently running trade bots." />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <Rocket className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-semibold font-headline">Manual Bot Launcher</h1>
                    <p className="text-muted-foreground">Configure and launch a new bot manually.</p>
                </div>
            </div>
            <BotConfiguration allPairs={filteredDScoreData} activeBots={activeBots} isLoading={isLoading} />
            <AiOptimizedReentries />
        </div>
      </div>
    </main>
  );
}
