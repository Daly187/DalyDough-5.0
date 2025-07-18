
import { getForexData } from '@/lib/fmp';
import { pairs } from '@/lib/data';
import type { DScore } from '@/lib/types';
import MarketDetailedTable from '@/components/market-detailed/market-detailed-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function MarketDetailedPage() {
    const forexData: DScore[] = await Promise.all(
      pairs.map(p => getForexData(p) as unknown as Promise<DScore>)
    );

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Market Detailed</CardTitle>
                    <CardDescription>
                        Raw indicator values calculated from historical price data for each pair. Data is refreshed automatically every hour.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MarketDetailedTable data={forexData} />
                </CardContent>
            </Card>
        </main>
    );
}
