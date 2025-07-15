import MeatMarketTable from '@/components/dashboard/meat-market-table';
import AutoBotScanner from '@/components/dashboard/auto-bot-scanner';
import SystemStatus from '@/components/dashboard/system-status';
import { dScoreData, botScannerData } from '@/lib/data';

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <SystemStatus />
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MeatMarketTable data={dScoreData} />
        </div>
        <div className="lg:col-span-1">
          <AutoBotScanner data={botScannerData} />
        </div>
      </div>
    </main>
  );
}
