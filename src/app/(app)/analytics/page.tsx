
'use client';

import * as React from 'react';
import EquityCurveChart from "@/components/analytics/equity-curve-chart";
import GlobalExposure from "@/components/analytics/global-exposure";
import RiskDashboard from "@/components/analytics/risk-dashboard";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { TradeAccount, Bot } from '@/lib/types';


export default function AnalyticsPage() {
    const [user] = useAuthState(auth);
    const [isLoading, setIsLoading] = React.useState(true);
    const [riskMetrics, setRiskMetrics] = React.useState<any[]>([]);
    const [equityData, setEquityData] = React.useState<any[]>([]);
    const [exposureData, setExposureData] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (user) {
            setIsLoading(true);
            const fetchData = async () => {
                // Fetch closed bots to analyze performance
                const botsQuery = query(collection(db, "bots"), where("uid", "==", user.uid), where("status", "==", "closed"));
                const botsSnapshot = await getDocs(botsQuery);
                const closedBots: Bot[] = botsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bot));

                // --- Calculate Risk Metrics ---
                const totalTrades = closedBots.length;
                const winningTrades = closedBots.filter(b => b.profit_loss > 0).length;
                const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
                // Note: Real drawdown, R:R, and exposure require more complex data/calculations
                
                setRiskMetrics([
                    { label: 'Win/Loss Ratio', value: `${winRate.toFixed(1)}%`, description: 'Based on closed bots' },
                    { label: 'Total Closed Trades', value: totalTrades, description: 'Total automated trades completed' },
                    { label: 'Avg. R:R', value: '1:1.8', description: 'Mock: Average risk to reward ratio' },
                    { label: 'Max Drawdown', value: '9.2%', description: 'Mock: Peak-to-trough decline' },
                ]);

                // --- Generate Equity Curve Data ---
                // This is a simplified mock-up. Real equity curve would need historical account snapshots.
                let cumulativeEquity = 50000; // Starting with a base
                const generatedEquityData = closedBots
                    .sort((a,b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
                    .map(bot => {
                        cumulativeEquity += bot.profit_loss;
                        return {
                            date: new Date((bot.createdAt?.seconds ?? 0) * 1000).toISOString(),
                            equity: cumulativeEquity
                        };
                    });
                setEquityData(generatedEquityData.length > 0 ? generatedEquityData : [{date: new Date().toISOString(), equity: cumulativeEquity}]);
                
                // Mock exposure data for now
                setExposureData([
                    { currency: 'EUR', exposure: 12500.50, type: 'long' },
                    { currency: 'USD', exposure: -8500.00, type: 'short' },
                    { currency: 'GBP', exposure: 7800.75, type: 'long' },
                ]);

                setIsLoading(false);
            };
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [user]);

  if (isLoading) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Analytics & Risk</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[105px] w-full" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Skeleton className="h-[380px] w-full" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-[380px] w-full" />
                </div>
            </div>
        </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Analytics & Risk</h1>
      </div>
      <div className="grid gap-4 md:gap-8">
        <RiskDashboard metrics={riskMetrics} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <EquityCurveChart data={equityData} />
            </div>
            <div className="lg:col-span-1">
                <GlobalExposure data={exposureData} />
            </div>
        </div>
      </div>
    </main>
  );
}
