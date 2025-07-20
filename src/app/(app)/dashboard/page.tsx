
'use client';

import * as React from 'react';
import MarketOverviewTable from '@/components/dashboard/market-overview-table';
import SystemStatus from '@/components/dashboard/system-status';
import { botConfigurationData, aiReentriesData } from '@/lib/data';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import BotConfiguration from '@/components/autobot/bot-configuration';
import { Rocket } from 'lucide-react';
import { getForexData } from '@/lib/fmp';
import type { DScore, Bot } from '@/lib/types';
import MarketControls from '@/components/dashboard/market-controls';
import { Skeleton } from '@/components/ui/skeleton';
import AiOptimizedReentries from '@/components/autobot/ai-optimized-reentries';
import { useRefresh } from '@/context/refresh-context';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { collection, getDocs, query, where, writeBatch, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


export default function DashboardPage() {
  const [allDScoreData, setAllDScoreData] = React.useState<DScore[]>([]);
  const [activeBots, setActiveBots] = React.useState<Bot[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dScoreThresholds, setDScoreThresholds] = React.useState({ lower: -7.0, upper: 7.0 });
  const { refreshKey, triggerRefresh } = useRefresh();
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchData() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // 1. Fetch user's symbol mappings
      const settingsRef = doc(db, 'userSettings', user.uid);
      const settingsSnap = await getDoc(settingsRef);
      let pairs: string[] = [];
      if (settingsSnap.exists() && settingsSnap.data().symbolMappings) {
        pairs = settingsSnap.data().symbolMappings.map((m: { apiSymbol: string }) => m.apiSymbol);
      } else {
        // Fallback to a default list if no mappings are found
        pairs = ['EUR/USD', 'USD/JPY', 'GBP/USD'];
      }

      if (pairs.length === 0) {
        setAllDScoreData([]);
        setActiveBots([]);
        setIsLoading(false);
        return;
      }
      
      const dScorePromise = Promise.all(
        pairs.map(p => getForexData(p) as unknown as Promise<DScore>)
      );
      
      const getBotsClientSide = async (uid: string): Promise<{ success: boolean; data?: Bot[]; error?: string }> => {
        try {
            const q = query(collection(db, "bots"), where("uid", "==", uid));
            const querySnapshot = await getDocs(q);
            const bots: Bot[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const botData = {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null,
                } as Bot;
                bots.push(botData);
            });
            return { success: true, data: bots };
        } catch (e) {
            console.error("Error getting documents: ", e);
            return { success: false, error: (e as Error).message };
        }
      };

      const botsPromise = getBotsClientSide(user.uid);

      const [calculatedScores, botsResult] = await Promise.all([dScorePromise, botsPromise]);

      setAllDScoreData(calculatedScores.filter(Boolean));
      
      if (botsResult.success && botsResult.data) {
        const allBots = botsResult.data as Bot[];
        setActiveBots(allBots.filter(b => b.status !== 'closed'));
      } else if (!botsResult.success) {
        console.error("Failed to fetch bots:", botsResult.error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Bots',
          description: botsResult.error
        });
      }

      setIsLoading(false);
    }
    fetchData();
  }, [refreshKey, user, toast]);

  const handleCloseAllBots = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
      return;
    }

    const batch = writeBatch(db);
    const botsToClose = activeBots.filter(bot => bot.status !== 'closed');
    
    if (botsToClose.length === 0) {
      toast({ title: 'No active bots to close.' });
      return;
    }

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
    return allDScoreData.filter(p => p.dScore <= dScoreThresholds.lower || p.dScore >= dScoreThresholds.upper);
  }, [allDScoreData, dScoreThresholds]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <SystemStatus />
      
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
