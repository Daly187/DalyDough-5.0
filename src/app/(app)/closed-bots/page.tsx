
'use client'

import * as React from 'react';
import ActiveBotsTable from '@/components/bots/active-bots-table';
import { useData } from '@/context/data-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClosedBotsPage() {
  const { isLoading, dScoreData, closedBots } = useData();

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
