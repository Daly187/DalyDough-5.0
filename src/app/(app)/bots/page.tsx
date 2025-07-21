
'use client'

import * as React from 'react';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import { useData } from '@/context/data-context';
import { Skeleton } from '@/components/ui/skeleton';
import PendingOrdersTable from '@/components/pending-orders/pending-orders-table';


export default function BotsPage() {
  const { isLoading, dScoreData, activeBots } = useData();
  
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
