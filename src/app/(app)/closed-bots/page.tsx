
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


export default function ClosedBotsPage() {
  const [user] = useAuthState(auth);
  const [dScoreData, setDScoreData] = React.useState<DScore[]>([]);
  const [closedBots, setClosedBots] = React.useState<Bot[]>([]);
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
              const q = query(collection(db, "bots"), where("uid", "==", uid), where("status", "==", "closed"));
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
          setClosedBots(botsResult.data);
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


  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl font-headline">Closed Bots</h1>
        </div>
        <div className="grid gap-8">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Closed Bots History</h1>
      </div>
      <div className="grid gap-8">
        <ActiveBotsTable data={closedBots} allPairs={dScoreData} title="Closed Bots" description="Review the performance of completed bot trades." isClosed={true} />
      </div>
    </main>
  );
}
