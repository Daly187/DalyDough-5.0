
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import StrengthIndexTable from "@/components/strength/strength-index-table";
import { strengthData } from "@/lib/data";

export default function StrengthPage() {
  // We only need the latest strength for each currency for the table
  const latestStrengthData = strengthData.map(currency => ({
    currency: currency.currency,
    strength: currency.data[currency.data.length - 1].strength,
  }));

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Currency Strength Index</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Currency Strength</CardTitle>
          <CardDescription>
            Real-time strength analysis for major currencies. A score of 1 is weakest, 10 is strongest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StrengthIndexTable data={latestStrengthData} />
        </CardContent>
      </Card>
    </main>
  );
}
