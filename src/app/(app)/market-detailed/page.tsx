
'use client';

import * as React from 'react';
import MarketDetailedTable from '@/components/market-detailed/market-detailed-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useData } from '@/context/data-context';

export default function MarketDetailedPage() {
    const { dScoreData, isLoading } = useData();

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Market Detailed</CardTitle>
                    <CardDescription>
                        Raw indicator values from historical data for each pair based on your symbol mappings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <Skeleton className="h-[60vh] w-full" />
                    ) : (
                        <MarketDetailedTable data={dScoreData} />
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
