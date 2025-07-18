
import { getForexData } from '@/lib/fmp';
import { pairs } from '@/lib/data';
import type { DScore } from '@/lib/types';
import MarketDetailTable from '@/components/market-detail/market-detail-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function MarketDetailPage() {
    // getForexData now returns a DScore-like object, which is what we need.
    const forexData: DScore[] = await Promise.all(
      pairs.map(p => getForexData(p) as unknown as Promise<DScore>)
    );

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Raw Market Data</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Locally Calculated Indicators</CardTitle>
                    <CardDescription>
                        Raw indicator values calculated from historical price data for each pair. Data is refreshed automatically every hour.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MarketDetailTable data={forexData} />
                </CardContent>
            </Card>
        </main>
    );
}
