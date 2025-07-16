
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import StrengthIndexTable from "@/components/strength/strength-index-table";
import { dScoreData } from "@/lib/data";
import type { CurrencyStrength } from "@/lib/types";

// Mock strength data for demonstration
const latestStrengthData: CurrencyStrength[] = [
    { currency: 'JPY', strength: 9.1 },
    { currency: 'GBP', strength: 8.5 },
    { currency: 'EUR', strength: 7.2 },
    { currency: 'AUD', strength: 6.8 },
    { currency: 'USD', strength: 5.5 },
    { currency: 'CAD', strength: 4.1 },
    { currency: 'NZD', strength: 3.2 },
    { currency: 'CHF', strength: 2.4 },
];

export default async function StrengthPage() {

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Currency Strength Index</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Currency Strength</CardTitle>
          <CardDescription>
            Real-time strength analysis for major currencies, calculated from daily price changes against a basket of peers. A score of 0 is weakest, 10 is strongest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StrengthIndexTable data={latestStrengthData} />
        </CardContent>
      </Card>
    </main>
  );
}
