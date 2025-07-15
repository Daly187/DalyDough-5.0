
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import StrengthIndexTable from "@/components/strength/strength-index-table";
import { calculateLiveCurrencyStrength, pairs } from "@/lib/data";
import { getForexData } from "@/lib/fmp";
import type { CurrencyStrength } from "@/lib/types";

export default async function StrengthPage() {
  const forexData = await getForexData(pairs);
  const latestStrengthData: CurrencyStrength[] = calculateLiveCurrencyStrength(forexData);

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
