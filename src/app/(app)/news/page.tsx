import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import NewsCalendar from "@/components/news/news-calendar";
import { newsData } from "@/lib/data";

export default function NewsPage() {
  const currencies = Array.from(new Set(newsData.map(event => event.currency)));
  const impacts = ['High', 'Medium', 'Low'];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Forex News Calendar</h1>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Economic Events</CardTitle>
          <CardDescription>
            Stay ahead of market-moving events with a real-time economic calendar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewsCalendar events={newsData} currencies={currencies} impacts={impacts} />
        </CardContent>
      </Card>
    </main>
  );
}
