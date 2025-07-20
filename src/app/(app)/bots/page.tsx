
'use client'

import * as React from 'react';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import { getForexData } from '@/lib/fmp';
import { DScore, Bot } from '@/lib/types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { db } from '@/lib/firebase/firestore';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import PendingOrdersTable from '@/components/pending-orders/pending-orders-table';


export default function BotsPage() {
  const [user] = useAuthState(auth);
  const [dScoreData, setDScoreData] = React.useState<DScore[]>([]);
  const [allBots, setAllBots] = React.useState<Bot[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);

        const settingsRef = doc(db, 'userSettings', user.uid);
        const settingsSnap = await getDoc(settingsRef);
        let pairs: string[] = [];
        if (settingsSnap.exists() && settingsSnap.data().symbolMappings) {
            pairs = settingsSnap.data().symbolMappings.map((m: { apiSymbol: string }) => m.apiSymbol);
        }

        let dScores: DScore[] = [];
        if (pairs.length > 0) {
            dScores = await Promise.all(
                pairs.map(p => getForexData(p) as unknown as Promise<DScore>)
            );
        }

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

        const [fetchedDScores, botsResult] = await Promise.all([dScores, botsPromise]);

        setDScoreData(fetchedDScores.filter(Boolean));
        if (botsResult.success && botsResult.data) {
          setAllBots(botsResult.data);
        } else {
          console.error("Failed to fetch bots:", botsResult.error);
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const activeBots = allBots.filter(b => b.status !== 'closed');
  
  const allPendingOrders = activeBots.flatMap(bot => 
    bot.pendingOrders?.map(order => ({ ...order, pair: bot.pair, botId: bot.id })) ?? []
  );

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl font-headline">Bots Management</h1>
        </div>
        <div className="grid gap-8">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Bots Management</h1>
      </div>
      <div className="grid gap-8">
        <ActiveBotsTable data={activeBots} allPairs={dScoreData} title="Active Bots" description="Manage and monitor your currently running trade bots."/>
        <PendingOrdersTable orders={allPendingOrders} />
      </div>
    </main>
  );
}
