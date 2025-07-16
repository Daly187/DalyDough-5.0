import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Cpu, ShieldAlert, Database, TestTube2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'Live' | 'Hybrid' | 'Mock';

const statusConfig: Record<Status, { color: string; icon: React.ReactNode }> = {
    Live: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
    },
    Hybrid: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <TestTube2 className="h-3 w-3" />
    },
    Mock: {
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        icon: <ShieldAlert className="h-3 w-3" />
    }
}

const statusItems: { label: string; icon: React.ReactNode; status: Status }[] = [
    { label: "Market Data (FMP)", icon: <Database className="h-5 w-5" />, status: 'Live' },
    { label: "D-Score Calculation", icon: <Cpu className="h-5 w-5" />, status: 'Hybrid' },
    { label: "Bot & Account Data", icon: <TestTube2 className="h-5 w-5" />, status: 'Mock' },
    { label: "Trade Execution", icon: <ShieldAlert className="h-5 w-5" />, status: 'Mock' },
];

export default function SystemStatus() {
  return (
    <Card>
        <CardHeader className="pb-4">
            <CardTitle className="font-headline text-xl">Data Source Status</CardTitle>
        </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusItems.map(item => {
            const config = statusConfig[item.status];
            return (
                <div key={item.label} className="flex items-center gap-3 bg-card p-3 rounded-lg border">
                    {item.icon}
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.label}</span>
                        <Badge variant="outline" className={cn("w-fit flex items-center gap-1.5", config.color)}>
                            {config.icon}
                            {item.status}
                        </Badge>
                    </div>
                </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  );
}
