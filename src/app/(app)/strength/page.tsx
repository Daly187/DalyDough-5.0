import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import StrengthIndexChart from "@/components/strength/strength-index-chart";
import { strengthData } from "@/lib/data";

export default function StrengthPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Currency Strength Index</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Multi-Timeframe Strength Analysis</CardTitle>
          <CardDescription>
            6 weeks of historical strength data for major currencies based on 4h, 1d, and 1w trend alignment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StrengthIndexChart data={strengthData} />
        </CardContent>
      </Card>
    </main>
  );
}
