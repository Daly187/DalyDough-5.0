import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbulb } from "lucide-react";
import type { AIReentry } from "@/lib/types";

interface AiOptimizedReentriesProps {
    reentries: AIReentry[];
}

export default function AiOptimizedReentries({ reentries }: AiOptimizedReentriesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Lightbulb className="h-5 w-5" />
                    AI-Optimized Re-entries
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Level</TableHead>
                            <TableHead>Price Offset</TableHead>
                            <TableHead>Lot Size</TableHead>
                            <TableHead>Condition</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reentries.map((reentry) => (
                            <TableRow key={reentry.level}>
                                <TableCell>{reentry.level}</TableCell>
                                <TableCell>{reentry.priceOffset}</TableCell>
                                <TableCell>{reentry.lotSize}</TableCell>
                                <TableCell>{reentry.condition}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
