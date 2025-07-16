
import { getForexData } from '@/lib/fmp';
import { calculateDScore, pairs } from '@/lib/data';
import { DScore } from '@/lib/types';
import MarketOverviewDetailTable from '@/components/market-overview/market-overview-detail-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function MarketOverviewPage() {
    const forexData = await getForexData(pairs);

    const dScoreData: DScore[] = await Promise.all(forexData.map(async (data, index) => 
        calculateDScore(data, index)
    ));

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Detailed Market Overview</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>D-Score Breakdown</CardTitle>
                    <CardDescription>
                        A detailed breakdown of all D-Score components for each currency pair.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MarketOverviewDetailTable data={dScoreData} />
                </CardContent>
            </Card>
        </main>
    );
}
