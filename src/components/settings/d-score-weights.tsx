
"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { DScoreWeights } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface DScoreWeightsProps {
  initialWeights: DScoreWeights;
}

const weightKeys: (keyof DScoreWeights)[] = [
    'trendAlignment',
    'adxStrength',
    'maConvergence',
    'srRetest',
    'priceStructure',
    'atrVolatility',
    'marketRegimeFit'
];

const weightLabels: Record<keyof DScoreWeights, string> = {
    trendAlignment: 'Trend Alignment',
    adxStrength: 'ADX Strength',
    maConvergence: 'MA Convergence',
    srRetest: 'S/R Retest',
    priceStructure: 'Price Structure',
    atrVolatility: 'ATR/Volatility',
    marketRegimeFit: 'Market Regime Fit'
};

export default function DScoreWeights({ initialWeights }: DScoreWeightsProps) {
  const [weights, setWeights] = React.useState<DScoreWeights>(initialWeights);
  const totalWeight = React.useMemo(() => Object.values(weights).reduce((sum, w) => sum + w, 0), [weights]);

  const handleSliderChange = (key: keyof DScoreWeights, value: number[]) => {
    const newValue = value[0];
    const oldValue = weights[key];
    const diff = newValue - oldValue;
    let newWeights = { ...weights, [key]: newValue };

    let remainingDiff = diff;
    const distributableKeys = weightKeys.filter(k => k !== key);
    let totalDistributable = distributableKeys.reduce((sum, k) => sum + newWeights[k], 0);

    if (totalDistributable > 0) {
        for (const k of distributableKeys) {
            const proportion = newWeights[k] / totalDistributable;
            const change = remainingDiff * proportion;
            newWeights[k] = Math.max(0, newWeights[k] - change);
        }
    }
    
    // Normalize to ensure total is exactly 10
    const currentTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
    const factor = 10 / currentTotal;
    
    for (const k of weightKeys) {
        newWeights[k] = parseFloat((newWeights[k] * factor).toFixed(2));
    }

    // Final check to fix any floating point inaccuracies
    const finalTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
    const roundingError = 10 - finalTotal;
    if (Math.abs(roundingError) > 0.001) {
       const keyToAdjust = weightKeys.find(k => newWeights[k] > 0) || 'trendAlignment';
       newWeights[keyToAdjust] += roundingError;
       newWeights[keyToAdjust] = parseFloat(newWeights[keyToAdjust].toFixed(2));
    }


    setWeights(newWeights);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline">D-Score Weights</CardTitle>
                <CardDescription>
                    Adjust the point allocation for each D-Score component.
                </CardDescription>
            </div>
            <Badge className="text-lg" variant={totalWeight.toFixed(2) === '10.00' ? 'default' : 'destructive'}>Total: {totalWeight.toFixed(2)} / 10</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {weightKeys.map((key) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor={key}>{weightLabels[key]}</Label>
                <span className="font-mono text-sm font-semibold text-primary">{weights[key].toFixed(2)} pts</span>
            </div>
            <Slider
              id={key}
              min={0}
              max={5}
              step={0.1}
              value={[weights[key]]}
              onValueChange={(value) => handleSliderChange(key, value)}
            />
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save Weights</Button>
      </CardFooter>
    </Card>
  );
}
