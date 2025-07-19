

import ActiveBotsTable from '@/components/bots/active-bots-table';
import { pairs } from '@/lib/data';
import { getForexData } from '@/lib/fmp';
import { DScore, Bot } from '@/lib/types';
import { getBots } from '@/app/actions';


export default async function BotsPage() {
  const dScoreData: DScore[] = await Promise.all(
    pairs.map(p => getForexData(p) as unknown as Promise<DScore>)
  );

  const { success, data: botsData, error } = await getBots();
  const allBots: Bot[] = success ? (botsData as Bot[]) : [];

  const activeBots = allBots.filter(b => b.status !== 'closed');
  const closedBots = allBots.filter(b => b.status === 'closed');

  if (!success) {
    console.error("Failed to fetch bots:", error);
    // Optionally render an error message to the user
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
