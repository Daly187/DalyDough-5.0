
'use client';

import * as React from 'react';
import MarketDetailTable from '@/components/market-detail/market-detail-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useData } from '@/context/data-context';

export default function DScoreDetailedPage() {
    const { dScoreData, isLoading } = useData();

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>D-Score Detailed</CardTitle>
                    <CardDescription>
                        Weighted scores calculated from raw indicator values for each pair based on your symbol mappings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-[60vh] w-full" />
                    ) : (
                        <MarketDetailTable data={dScoreData} />
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
