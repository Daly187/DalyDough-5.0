

import ActiveBotsTable from '@/components/bots/active-bots-table';
import { activeBotsData, closedBotsData, dScoreData } from '@/lib/data';
import type { DScore } from '@/lib/types';


export default async function BotsPage() {
  // Using mock dScoreData directly from data.ts
  const allPairsData: DScore[] = dScoreData;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Bots Management</h1>
      </div>
      <div className="grid gap-8">
        <ActiveBotsTable data={activeBotsData} allPairs={allPairsData} title="Active Bots" description="Manage and monitor your currently running trade bots."/>
        <ActiveBotsTable data={closedBotsData} allPairs={allPairsData} title="Closed Bots" description="Review the performance of completed bot trades." isClosed={true} />
      </div>
    </main>
  );
}
