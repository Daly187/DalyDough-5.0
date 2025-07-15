
"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { DScoreWeights } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';

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
    'marketRegimeFit',
    'currencyStrength'
];

const weightLabels: Record<keyof DScoreWeights, string> = {
    trendAlignment: 'Trend Alignment',
    adxStrength: 'ADX Strength',
    maConvergence: 'MA Convergence',
    srRetest: 'S/R Retest',
    priceStructure: 'Price Structure',
    atrVolatility: 'ATR/Volatility',
    marketRegimeFit: 'Market Regime Fit',
    currencyStrength: 'Currency Strength'
};

const tooltipTexts: Record<keyof DScoreWeights, string> = {
    trendAlignment: 'Scores the alignment of trends across daily and weekly timeframes.',
    adxStrength: 'Measures the strength of the current trend using the Average Directional Index (ADX).',
    maConvergence: 'Scores the alignment of 50, 100, and 200-period moving averages to confirm momentum.',
    srRetest: 'Identifies if the price is currently retesting a significant support or resistance level (major MAs).',
    priceStructure: 'Analyzes the clarity of market structure based on +DI vs -DI separation.',
    atrVolatility: 'Measures market volatility using the Average True Range (ATR) as a percentage of price.',
    marketRegimeFit: 'Assesses how well the current price action fits a trending or ranging market model.',
    currencyStrength: 'Scores the strength difference between the base and quote currency.'
};

const aiRecommendedWeights: DScoreWeights = {
    trendAlignment: 2.0,
    adxStrength: 1.0,
    maConvergence: 1.5,
    srRetest: 0.5,
    priceStructure: 1.0,
    atrVolatility: 0.5,
    marketRegimeFit: 2.0,
    currencyStrength: 1.5,
};

export default function DScoreWeights({ initialWeights }: DScoreWeightsProps) {
  const [weights, setWeights] = React.useState<DScoreWeights>(initialWeights);
  const [useAiPicks, setUseAiPicks] = React.useState(false);

  const totalWeight = React.useMemo(() => Object.values(weights).reduce((sum, w) => sum + w, 0), [weights]);

  const handleSliderChange = (key: keyof DScoreWeights, value: number[]) => {
    setWeights(prev => ({...prev, [key]: value[0]}));
  };
  
  const handleAiPicksChange = (checked: boolean) => {
    setUseAiPicks(checked);
    if (checked) {
        setWeights(aiRecommendedWeights);
    } else {
        setWeights(initialWeights); // Revert to initial weights when unchecked
    }
  }

  const TooltipLabel = ({ htmlFor, label, tooltipText }: { htmlFor: string, label: string, tooltipText: string }) => (
    <div className="flex items-center gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

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
            <Badge className="text-lg" variant={totalWeight.toFixed(2) === '10.00' ? 'default' : 'destructive'}>Total: {totalWeight.toFixed(2)} / 10.00</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox id="ai-picks" checked={useAiPicks} onCheckedChange={handleAiPicksChange} />
            <Label htmlFor="ai-picks" className="text-base font-semibold text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Let AI Decide
            </Label>
        </div>

        {weightKeys.map((key) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
                <TooltipLabel htmlFor={key} label={weightLabels[key]} tooltipText={tooltipTexts[key]} />
                <span className="font-mono text-sm font-semibold text-primary">{weights[key].toFixed(2)} pts</span>
            </div>
            <Slider
              id={key}
              min={0}
              max={5}
              step={0.1}
              value={[weights[key]]}
              onValueChange={(value) => handleSliderChange(key, value)}
              disabled={useAiPicks}
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
