import MeatMarketTable from '@/components/dashboard/meat-market-table';
import AutoBotScanner from '@/components/dashboard/auto-bot-scanner';
import SystemStatus from '@/components/dashboard/system-status';
import { dScoreData, activeBotsData } from '@/lib/data';
import ActiveBotsTable from '@/components/bots/active-bots-table';

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <SystemStatus />
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <MeatMarketTable data={dScoreData} />
            <ActiveBotsTable data={activeBotsData} title="Active Bots" description="A real-time overview of all currently running trade bots." />
        </div>
        <div className="lg:col-span-1">
            <AutoBotScanner />
        </div>
      </div>
    </main>
  );
}
