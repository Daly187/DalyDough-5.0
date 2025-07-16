
"use client";

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getDScoreExplanation } from '@/app/actions';
import type { DScore } from '@/lib/types';
import { DScoreExplanationInput } from '@/ai/flows/d-score-explanation';

interface DScoreExplanationSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pairData: DScore | null;
}

export default function DScoreExplanationSheet({ isOpen, onOpenChange, pairData }: DScoreExplanationSheetProps) {
  const [explanation, setExplanation] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (pairData && isOpen) {
      const fetchExplanation = async () => {
        setIsLoading(true);
        setError('');
        setExplanation('');
        
        const input: DScoreExplanationInput = {
            currencyPair: pairData.pair,
            dScore: pairData.dScore,
            adxStrength: pairData.adxStrength,
            atrVolatility: pairData.atrVolatility,
            srRetest: pairData.srRetest,
            priceStructure: pairData.priceStructure,
            marketRegimeFit: pairData.marketRegimeFit,
            currencyStrengthIndex: pairData.currencyStrengthIndex,
        };
        
        const result = await getDScoreExplanation(input);
        
        if (result.success && result.data) {
          setExplanation(result.data.explanation);
        } else {
          setError(result.error || 'An unknown error occurred.');
        }
        setIsLoading(false);
      };

      fetchExplanation();
    }
  }, [pairData, isOpen]);

  const scoreFactors = [
    { label: "ADX Strength", value: pairData?.adxStrength, max: 2.0 },
    { label: "ATR/Volatility", value: pairData?.atrVolatility, max: 1.5 },
    { label: "S/R Retest", value: pairData?.srRetest, max: 2.0 },
    { label: "Price Structure", value: pairData?.priceStructure, max: 1.5 },
    { label: "Market Regime Fit", value: pairData?.marketRegimeFit, max: 2.0 },
    { label: "Currency Strength", value: pairData?.currencyStrengthIndex, max: 1.0 },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader className="text-left">
          <SheetTitle className="font-headline text-2xl">D-Score Analysis: {pairData?.pair}</SheetTitle>
          <SheetDescription>
            Detailed breakdown of the score components and an AI-powered explanation.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
            <div className="text-center bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Final Score</p>
                <p className="text-4xl font-bold text-primary">{pairData?.dScore.toFixed(1)}</p>
            </div>

            <Separator />
            
            <h4 className="font-semibold text-foreground">AI Explanation</h4>
            {isLoading && (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {explanation && <p className="text-sm text-muted-foreground">{explanation}</p>}

            <Separator />
            
            <h4 className="font-semibold text-foreground">Score Components</h4>
            <ul className="space-y-2">
                {scoreFactors.map(factor => (
                    <li key={factor.label} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{factor.label}</span>
                        <span className="font-mono font-medium text-foreground">{factor.value?.toFixed(1)} / {factor.max.toFixed(1)}</span>
                    </li>
                ))}
            </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
