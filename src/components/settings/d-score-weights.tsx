
"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { DScoreWeights } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Sparkles, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { defaultWeights, aiRecommendedWeights } from '@/lib/data';

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
    srRetest: 'Identifies if the price is currently retesting a significant support or resistance level.',
    priceStructure: 'Analyzes the clarity of market structure based on +DI vs -DI separation.',
    atrVolatility: 'Measures market volatility using the Average True Range (ATR) as a percentage of price.',
    marketRegimeFit: 'Assesses how well the current price action fits a trending or ranging market model.',
    currencyStrength: 'Scores the strength difference between the base and quote currency.'
};

export default function DScoreWeightsComponent({ initialWeights: serverInitialWeights }: DScoreWeightsProps) {
  const [weights, setWeights] = React.useState<DScoreWeights>(serverInitialWeights);
  const [useAiPicks, setUseAiPicks] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    // On component mount, try to load weights from localStorage
    const savedWeights = localStorage.getItem('d_score_weights');
    if (savedWeights) {
      try {
        const parsedWeights = JSON.parse(savedWeights);
        setWeights(parsedWeights);
        // Also check if the loaded weights match the AI picks to set the checkbox state
        if (JSON.stringify(parsedWeights) === JSON.stringify(aiRecommendedWeights)) {
          setUseAiPicks(true);
        }
      } catch (error) {
        console.error("Failed to parse weights from localStorage:", error);
        setWeights(serverInitialWeights);
      }
    }
  }, [serverInitialWeights]);

  const totalWeight = React.useMemo(() => Object.values(weights).reduce((sum, w) => sum + w, 0), [weights]);

  const handleSliderChange = (key: keyof DScoreWeights, value: number[]) => {
    if (useAiPicks) setUseAiPicks(false); // Uncheck AI picks if user manually adjusts
    setWeights(prev => ({...prev, [key]: value[0]}));
  };
  
  const handleAiPicksChange = (checked: boolean) => {
    setUseAiPicks(checked);
    if (checked) {
      setWeights(aiRecommendedWeights);
    } else {
      setWeights(defaultWeights); // Revert to default when unchecked
    }
  }

  const handleSaveChanges = () => {
    try {
      localStorage.setItem('d_score_weights', JSON.stringify(weights));
      toast({
        title: "Settings Saved",
        description: "Your D-Score weights have been saved and will be applied on the next data refresh.",
      });
    } catch (error) {
      console.error("Failed to save weights to localStorage:", error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Could not save your settings. Please try again.",
      });
    }
  };
  
  const handleReset = () => {
    setUseAiPicks(false);
    setWeights(defaultWeights);
    localStorage.removeItem('d_score_weights');
    toast({
        title: "Settings Reset",
        description: "Weights have been reset to their default values.",
    });
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
                    Adjust the point allocation for each D-Score component. Changes require a page refresh to apply.
                </CardDescription>
            </div>
            <Badge className="text-lg" variant={totalWeight.toFixed(2) === '10.00' ? 'default' : 'destructive'}>Total: {totalWeight.toFixed(2)} / 10.00</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Checkbox id="ai-picks" checked={useAiPicks} onCheckedChange={handleAiPicksChange} />
            <Label htmlFor="ai-picks" className="text-base font-semibold text-primary flex items-center gap-2 cursor-pointer">
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
            />
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex justify-between">
        <Button onClick={handleSaveChanges}>Save Weights</Button>
        <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
        </Button>
      </CardFooter>
    </Card>
  );
}

// Renaming component to avoid confusion with the type
export { DScoreWeightsComponent as DScoreWeights };
