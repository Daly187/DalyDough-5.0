import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Cpu, BarChartBig, Database } from 'lucide-react';

const statusItems = [
    { label: "D-Size Algorithm", icon: <Cpu className="h-4 w-4" /> },
    { label: "Trend Analysis", icon: <BarChartBig className="h-4 w-4" /> },
    { label: "Market Data", icon: <Database className="h-4 w-4" /> },
    { label: "Ready to Trade", icon: <CheckCircle2 className="h-4 w-4" /> },
]

export default function SystemStatus() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusItems.map(item => (
            <div key={item.label} className="flex items-center justify-center md:justify-start gap-3">
                {item.icon}
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge variant="outline" className="w-fit flex items-center gap-1.5 bg-green-500/20 text-green-400 border-green-500/30">
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                        Active
                    </Badge>
                </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
