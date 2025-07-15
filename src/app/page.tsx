import MarketRegimeCard from '@/components/dashboard/market-regime-card';
import DScoreTable from '@/components/dashboard/d-score-table';
import { dScoreData, marketRegimeData } from '@/lib/data';

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <MarketRegimeCard data={marketRegimeData} />
      </div>
      <div>
        <DScoreTable data={dScoreData} />
      </div>
    </main>
  );
}
