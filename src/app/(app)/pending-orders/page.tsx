
'use client'

import * as React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Bot } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tornado } from 'lucide-react';
import PendingOrdersTable from '@/components/pending-orders/pending-orders-table';

export default function PendingOrdersPage() {
  const [user] = useAuthState(auth);
  const [activeBots, setActiveBots] = React.useState<Bot[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBots = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const q = query(collection(db, "bots"), where("uid", "==", user.uid), where("status", "==", "active"));
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
          setActiveBots(bots);
        } catch (e) {
            console.error("Error getting documents: ", e);
        } finally {
            setIsLoading(false);
        }
      } else if (user === null) {
          setIsLoading(false); // No user logged in
      }
    };
    fetchBots();
  }, [user]);
  
  const allPendingOrders = activeBots.flatMap(bot => 
    bot.pendingOrders?.map(order => ({ ...order, pair: bot.pair, botId: bot.id })) ?? []
  );

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Tornado className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold font-headline">Pending Bot Orders</h1>
            <p className="text-muted-foreground">A detailed view of all scheduled grid orders for your active bots.</p>
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Tornado className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold font-headline">Pending Bot Orders</h1>
          <p className="text-muted-foreground">A detailed view of all scheduled grid orders for your active bots.</p>
        </div>
      </div>
      <PendingOrdersTable orders={allPendingOrders} />
    </main>
  );
}
