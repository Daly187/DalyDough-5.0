import MeatMarketTable from '@/components/dashboard/meat-market-table';
import SystemStatus from '@/components/dashboard/system-status';
import { dScoreData, activeBotsData } from '@/lib/data';
import ActiveBotsTable from '@/components/bots/active-bots-table';

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <SystemStatus />
      <div className="space-y-8">
          <MeatMarketTable data={dScoreData} />
          <ActiveBotsTable data={activeBotsData.slice(0, 4)} title="Active Bots" description="A real-time overview of all currently running trade bots." />
      </div>
    </main>
  );
}
