import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import NewsCalendar from "@/components/news/news-calendar";
import { getEconomicCalendar } from "@/lib/fmp";
import type { NewsEvent } from "@/lib/types";
import { RefreshCw } from "lucide-react";
import RefreshButton from "@/components/news/refresh-button";

export default async function NewsPage() {
  const events: NewsEvent[] = await getEconomicCalendar() ?? [];

  const currencies = Array.from(new Set(events.map(event => event.currency))).filter(Boolean) as string[];
  const impacts = ['High', 'Medium', 'Low'];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Forex News Calendar</h1>
      </div>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Economic Events</CardTitle>
                <CardDescription>
                    Stay ahead of market-moving events with a real-time economic calendar.
                </CardDescription>
            </div>
            <RefreshButton />
        </CardHeader>
        <CardContent>
          <NewsCalendar events={events} currencies={currencies} impacts={impacts} />
        </CardContent>
      </Card>
    </main>
  );
}
