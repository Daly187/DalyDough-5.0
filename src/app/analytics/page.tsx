import EquityCurveChart from "@/components/analytics/equity-curve-chart";
import RiskDashboard from "@/components/analytics/risk-dashboard";
import { equityData, riskMetricsData } from "@/lib/data";

export default function AnalyticsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Analytics & Risk</h1>
      </div>
      <div className="grid gap-4 md:gap-8">
        <RiskDashboard metrics={riskMetricsData} />
        <EquityCurveChart data={equityData} />
      </div>
    </main>
  );
}
