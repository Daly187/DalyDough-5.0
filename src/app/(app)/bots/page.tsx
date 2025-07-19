
'use client'

import * as React from 'react';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import { pairs } from '@/lib/data';
import { getForexData } from '@/lib/fmp';
import { DScore, Bot } from '@/lib/types';
import { getBots } from '@/app/actions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';


export default function BotsPage() {
  const [user] = useAuthState(auth);
  const [dScoreData, setDScoreData] = React.useState<DScore[]>([]);
  const [allBots, setAllBots] = React.useState<Bot[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setIsLoading(true);
        const dScorePromise = Promise.all(pairs.map(p => getForexData(p) as unknown as Promise<DScore>));
        const botsPromise = getBots(user.uid);

        const [dScores, botsResult] = await Promise.all([dScorePromise, botsPromise]);

        setDScoreData(dScores);
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
  const closedBots = allBots.filter(b => b.status === 'closed');

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
        <ActiveBotsTable data={closedBots} allPairs={dScoreData} title="Closed Bots" description="Review the performance of completed bot trades." isClosed={true} />
      </div>
    </main>
  );
}
