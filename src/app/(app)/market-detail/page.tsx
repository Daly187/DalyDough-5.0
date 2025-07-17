
import { getForexData } from '@/lib/fmp';
import { pairs } from '@/lib/data';
import type { ForexData } from '@/lib/types';
import MarketDetailTable from '@/components/market-detail/market-detail-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function MarketDetailPage() {
    const forexData: ForexData[] = await Promise.all(pairs.map(p => getForexData(p)));

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Raw Market Data</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>FMP API Data</CardTitle>
                    <CardDescription>
                        The raw technical indicator data fetched from the Financial Modeling Prep API for each pair.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MarketDetailTable data={forexData} />
                </CardContent>
            </Card>
        </main>
    );
}
