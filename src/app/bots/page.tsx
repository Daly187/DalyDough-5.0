import ActiveBotsTable from '@/components/bots/active-bots-table';
import { activeBotsData } from '@/lib/data';

export default function BotsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Active Bots Management</h1>
      </div>
      <div className="grid gap-4 md:gap-8">
        <ActiveBotsTable data={activeBotsData} />
      </div>
    </main>
  );
}
