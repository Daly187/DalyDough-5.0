import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import CotChart from "@/components/cot/cot-chart";
import { cotData } from "@/lib/data";

export default function CotPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">COT Report Analysis</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Institutional Intelligence</CardTitle>
          <CardDescription>
            6 weeks of historical COT data for major currencies to understand smart money sentiment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CotChart data={cotData} />
        </CardContent>
      </Card>
    </main>
  );
}
