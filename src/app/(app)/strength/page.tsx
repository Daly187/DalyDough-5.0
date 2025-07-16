import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import StrengthTable from "@/components/strength/strength-table";
import { strengthData } from "@/lib/data";

export default function StrengthPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Currency Strength Index</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>5-Day Trend Analysis</CardTitle>
          <CardDescription>
            Daily strength trend for major currencies. Consecutive trends influence the D-Score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StrengthTable strengthData={strengthData} />
        </CardContent>
      </Card>
    </main>
  );
}
