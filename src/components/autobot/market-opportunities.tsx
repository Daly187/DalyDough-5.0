import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { DScore } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MarketOpportunitiesProps {
    opportunities: DScore[];
}

const gradeColors = {
  A: 'bg-green-500/20 text-green-400 border-green-500/30',
  B: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  C: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const signalConfig = {
    Buy: { color: "text-green-400", icon: <ArrowUp className="h-3 w-3 mr-1" />, label: "Buy" },
    Sell: { color: "text-red-400", icon: <ArrowDown className="h-3 w-3 mr-1" />, label: "Sell" },
    Block: { color: "text-muted-foreground", icon: null, label: "Block" },
};

export default function MarketOpportunities({ opportunities }: MarketOpportunitiesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center font-headline">
                    <div className="flex items-center gap-2">
                        Market Opportunities
                    </div>
                    <Badge variant="secondary">{opportunities.length} pairs</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                 <div className="h-[300px] overflow-y-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card">
                            <TableRow>
                                <TableHead>PAIR</TableHead>
                                <TableHead>SCORE</TableHead>
                                <TableHead>QLY</TableHead>
                                <TableHead>SIGNAL</TableHead>
                                <TableHead className="text-right">POS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {opportunities.map((item) => {
                                const signal = signalConfig[item.signal];
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.pair}</TableCell>
                                        <TableCell className="font-semibold text-primary">{item.dScore.toFixed(1)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn("text-xs font-bold", gradeColors[item.grade])}>
                                                {item.grade}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                             <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs",
                                                    item.signal === 'Buy' && 'bg-green-500/20 text-green-400 border-green-500/30',
                                                    item.signal === 'Sell' && 'bg-red-500/20 text-red-400 border-red-500/30',
                                                    item.signal === 'Block' && 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                                )}
                                            >
                                                {signal.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end">
                                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                                    {item.positions ?? 0}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
