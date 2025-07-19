
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchHistorical } from "@/lib/api/fmp-api";
import { FMPHistoricalPrice } from "@/lib/types";
import { Tornado, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const currencyIndices = [
    { symbol: '^DXY', name: 'US Dollar Index' },
    { symbol: '^EXY', name: 'Euro Index' },
    { symbol: '^BXY', name: 'British Pound Index' },
    { symbol: '^JXY', name: 'Japanese Yen Index' },
    { symbol: '^CXY', name: 'Canadian Dollar Index' },
    { symbol: '^AXY', name: 'Australian Dollar Index' },
    { symbol: '^SXY', name: 'Swiss Franc Index' },
];

async function getStrengthData() {
    const dataPromises = currencyIndices.map(async (currency) => {
        const historicalData: FMPHistoricalPrice[] | null = await fetchHistorical(currency.symbol, 10);
        
        if (!historicalData || historicalData.length < 2) {
            return {
                name: currency.name,
                symbol: currency.symbol,
                strength: 0,
                change: 0,
                trend: 'neutral' as const
            };
        }
        
        // Data is newest to oldest, so [0] is today, [1] is yesterday.
        const latestStrength = historicalData[0].close;
        const previousStrength = historicalData[1].close;
        const change = latestStrength - previousStrength;

        let trend: 'up' | 'down' | 'neutral' = 'neutral';
        if (change > 0) trend = 'up';
        if (change < 0) trend = 'down';

        return {
            name: currency.name,
            symbol: currency.symbol,
            strength: latestStrength,
            change,
            trend
        };
    });

    return Promise.all(dataPromises);
}


export default async function StrengthPage() {
    const strengthData = await getStrengthData();

    const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
        if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-500" />;
        if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                <Tornado className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-semibold font-headline">Currency Strength Index</h1>
                    <p className="text-muted-foreground">Real-time strength of major currencies based on their respective indices.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Major Currency Indices</CardTitle>
                    <CardDescription>
                        This table shows the latest closing value for major currency indices and the change from the previous day.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Currency Index</TableHead>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Last Close</TableHead>
                                <TableHead>Change</TableHead>
                                <TableHead className="text-right">Trend</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {strengthData.map((data) => (
                                <TableRow key={data.symbol}>
                                    <TableCell className="font-medium">{data.name}</TableCell>
                                    <TableCell>{data.symbol}</TableCell>
                                    <TableCell className="font-semibold">{data.strength.toFixed(2)}</TableCell>
                                    <TableCell className={cn(data.change > 0 ? 'text-green-400' : data.change < 0 ? 'text-red-400' : 'text-muted-foreground')}>
                                        {data.change.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TrendIcon trend={data.trend} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
