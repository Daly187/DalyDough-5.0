
import ActiveBotsTable from '@/components/bots/active-bots-table';
import { activeBotsData, closedBotsData, calculateDScore, pairs } from '@/lib/data';
import { getForexData } from '@/lib/fmp';
import { DScore } from '@/lib/types';


export default async function BotsPage() {
  const forexData = await getForexData(pairs);

  const dScoreData: DScore[] = await Promise.all(
    forexData.map((data, index) => calculateDScore(data, index))
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Bots Management</h1>
      </div>
      <div className="grid gap-8">
        <ActiveBotsTable data={activeBotsData} allPairs={dScoreData} title="Active Bots" description="Manage and monitor your currently running trade bots."/>
        <ActiveBotsTable data={closedBotsData} allPairs={dScoreData} title="Closed Bots" description="Review the performance of completed bot trades." isClosed={true} />
      </div>
    </main>
  );
}
