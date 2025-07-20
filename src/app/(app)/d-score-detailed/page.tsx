
'use client';

import * as React from 'react';
import { getForexData } from '@/lib/fmp';
import type { DScore } from '@/lib/types';
import MarketDetailTable from '@/components/market-detail/market-detail-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function DScoreDetailedPage() {
    const [user] = useAuthState(auth);
    const [forexData, setForexData] = React.useState<DScore[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAndSetData = async () => {
            if (user) {
                setIsLoading(true);
                const settingsRef = doc(db, 'userSettings', user.uid);
                const settingsSnap = await getDoc(settingsRef);
                let pairs: string[] = [];
                if (settingsSnap.exists() && settingsSnap.data().symbolMappings) {
                    pairs = settingsSnap.data().symbolMappings.map((m: { apiSymbol: string }) => m.apiSymbol);
                } else {
                    pairs = ['EUR/USD', 'USD/JPY', 'GBP/USD']; // Fallback
                }
                
                if (pairs.length > 0) {
                    const data = await Promise.all(
                        pairs.map(p => getForexData(p) as unknown as Promise<DScore>)
                    );
                    setForexData(data.filter(Boolean));
                } else {
                    setForexData([]);
                }
                setIsLoading(false);
            }
        };

        fetchAndSetData();
    }, [user]);

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
                        <MarketDetailTable data={forexData} />
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
