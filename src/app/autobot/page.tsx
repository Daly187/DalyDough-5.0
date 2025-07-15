import AutoBotScanner from '@/components/dashboard/auto-bot-scanner';

export default function AutoBotPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        <AutoBotScanner />
      </div>
    </main>
  );
}
