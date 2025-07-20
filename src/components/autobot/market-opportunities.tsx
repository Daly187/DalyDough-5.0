
"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { DScore } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

interface MarketOpportunitiesProps {
    opportunities: DScore[];
    includedPairs: Record<string, boolean>;
    onInclusionChange: (pair: string, included: boolean) => void;
}

const gradeColors = {
  A: 'bg-green-500/20 text-green-400 border-green-500/30',
  B: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  C: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const signalConfig = {
    Buy: { color: "text-green-400", label: "Buy" },
    Sell: { color: "text-red-400", label: "Sell" },
    Block: { color: "text-muted-foreground", label: "Block" },
};

export default function MarketOpportunities({ opportunities, includedPairs, onInclusionChange }: MarketOpportunitiesProps) {
    const [sortKey, setSortKey] = React.useState<keyof DScore>('dScore');
    const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

    const sortedData = React.useMemo(() => {
        return [...opportunities].sort((a, b) => {
            const aVal = Math.abs(a[sortKey] as number);
            const bVal = Math.abs(b[sortKey] as number);
            return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
        });
    }, [opportunities, sortKey, sortOrder]);

    const formatScore = (score: number) => (score > 0 ? '+' : '') + score.toFixed(1);
    
    const includedCount = Object.values(includedPairs).filter(Boolean).length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center font-headline">
                    <div className="flex items-center gap-2">
                        Market Opportunities
                    </div>
                    <Badge variant="secondary">{includedCount} / {opportunities.length} pairs included</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                 <ScrollArea className="h-[450px]">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card">
                            <TableRow>
                                <TableHead className="w-[50px]">Incl.</TableHead>
                                <TableHead>PAIR</TableHead>
                                <TableHead>SCORE</TableHead>
                                <TableHead>GRADE</TableHead>
                                <TableHead>SIGNAL</TableHead>
                                <TableHead className="text-right">BOTS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedData.map((item) => {
                                const signal = signalConfig[item.signal];
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={includedPairs[item.pair] ?? false}
                                                onCheckedChange={(checked) => onInclusionChange(item.pair, !!checked)}
                                                id={`include-${item.pair}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{item.pair}</TableCell>
                                        <TableCell className={cn("font-semibold", item.dScore > 0 ? "text-green-400" : "text-red-400")}>
                                            {formatScore(item.dScore)}
                                        </TableCell>
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
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
