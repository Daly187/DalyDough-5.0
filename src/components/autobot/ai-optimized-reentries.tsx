
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbulb } from "lucide-react";

const reentriesData = [
  { level: 2, priceOffset: "-18 pips", lotSize: 0.02, condition: "RSI < 40" },
  { level: 3, priceOffset: "-35 pips", lotSize: 0.04, condition: "Vol > Avg" },
  { level: 4, priceOffset: "-50 pips", lotSize: 0.08, condition: "On Sup" },
  { level: 5, priceOffset: "-75 pips", lotSize: 0.16, condition: "Extreme" },
];


export default function AiOptimizedReentries() {
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
                        {reentriesData.map((reentry) => (
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
