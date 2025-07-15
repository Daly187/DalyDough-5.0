"use client";

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BotMessageSquare } from 'lucide-react';
import type { DScore } from '@/lib/types';
import DScoreExplanationSheet from './d-score-explanation-sheet';

interface DScoreTableProps {
  data: DScore[];
}

export default function DScoreTable({ data }: DScoreTableProps) {
  const [selectedPair, setSelectedPair] = React.useState<DScore | null>(null);

  const handleExplainClick = (pair: DScore) => {
    setSelectedPair(pair);
  };

  const getProgressColor = (value: number) => {
    if (value > 7) return 'bg-green-500';
    if (value > 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Adaptive D-Score</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pair</TableHead>
                <TableHead className="w-[150px]">D-Score</TableHead>
                <TableHead>Final Score</TableHead>
                <TableHead>COT Bias</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Volatility</TableHead>
                <TableHead>Structure</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const finalScore = (item.dScore * item.regimeMultiplier).toFixed(2);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.pair}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Progress value={item.dScore * 10} className="h-2 [&>div]:bg-primary" />
                        <span className="font-semibold">{item.dScore.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-lg text-primary">{finalScore}</TableCell>
                    <TableCell>{item.cotBias.toFixed(1)}</TableCell>
                    <TableCell>{item.trendAlignment.toFixed(1)}</TableCell>
                    <TableCell>{item.atrVolatility.toFixed(1)}</TableCell>
                    <TableCell>{item.priceStructure.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleExplainClick(item)}>
                        <BotMessageSquare className="h-4 w-4" />
                        <span className="sr-only">Explain Score</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <DScoreExplanationSheet
        isOpen={!!selectedPair}
        onOpenChange={(open) => !open && setSelectedPair(null)}
        pairData={selectedPair}
      />
    </>
  );
}
