
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import StrengthTable from "@/components/strength/strength-table";
import { getStrengthData } from "@/lib/fmp";

export default async function StrengthPage() {
  const strengthData = await getStrengthData();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Currency Strength Index</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>10-Day Trend Analysis</CardTitle>
          <CardDescription>
            Daily strength trend for major currencies based on their performance against the USD (or DXY for USD). Consecutive trends influence the D-Score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StrengthTable strengthData={strengthData} />
        </CardContent>
      </Card>
    </main>
  );
}
