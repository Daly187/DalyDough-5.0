
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
import type { Bot, ExposureData } from '@/lib/types';


export default function AnalyticsPage() {
    const [user] = useAuthState(auth);
    const [isLoading, setIsLoading] = React.useState(true);
    const [riskMetrics, setRiskMetrics] = React.useState<any[]>([]);
    const [equityData, setEquityData] = React.useState<any[]>([]);
    const [exposureData, setExposureData] = React.useState<ExposureData[]>([]);

    React.useEffect(() => {
        if (user) {
            setIsLoading(true);
            const fetchData = async () => {
                const botsCollection = collection(db, "bots");
                const q = query(botsCollection, where("uid", "==", user.uid));
                const botsSnapshot = await getDocs(q);
                
                const allBots: Bot[] = botsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bot));
                const closedBots = allBots.filter(b => b.status === "closed");
                const activeBots = allBots.filter(b => b.status === "active");

                // --- Calculate Risk Metrics ---
                const totalTrades = closedBots.length;
                const winningTrades = closedBots.filter(b => b.profit_loss > 0).length;
                const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
                
                setRiskMetrics([
                    { label: 'Win/Loss Ratio', value: `${winRate.toFixed(1)}%`, description: 'Based on closed bots' },
                    { label: 'Total Closed Trades', value: totalTrades, description: 'Total automated trades completed' },
                    { label: 'Active Bots', value: activeBots.length, description: 'Currently running automated trades' },
                    { label: 'Max Drawdown', value: '9.2%', description: 'Mock: Peak-to-trough decline' },
                ]);

                // --- Generate Equity Curve Data ---
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
                
                // --- Calculate Global Exposure ---
                const exposureMap: { [currency: string]: { long: number, short: number } } = {};
                
                activeBots.forEach(bot => {
                    const [base, quote] = bot.pair.split('/');
                    const lotValue = (bot.lotSize ?? 0.01) * 100000; // Simplified exposure calculation

                    if (bot.direction === 'Buy') {
                        exposureMap[base] = { long: (exposureMap[base]?.long || 0) + lotValue, short: exposureMap[base]?.short || 0 };
                        exposureMap[quote] = { long: exposureMap[quote]?.long || 0, short: (exposureMap[quote]?.short || 0) - lotValue };
                    } else if (bot.direction === 'Sell') {
                        exposureMap[base] = { long: exposureMap[base]?.long || 0, short: (exposureMap[base]?.short || 0) - lotValue };
                        exposureMap[quote] = { long: (exposureMap[quote]?.long || 0) + lotValue, short: exposureMap[quote]?.short || 0 };
                    }
                });
                
                const generatedExposureData: ExposureData[] = Object.entries(exposureMap).map(([currency, values]) => {
                    const netExposure = values.long + values.short;
                    return {
                        currency,
                        exposure: netExposure,
                        type: netExposure > 0 ? 'long' : 'short'
                    }
                });
                
                setExposureData(generatedExposureData);

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
