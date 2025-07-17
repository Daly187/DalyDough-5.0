
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';

interface MarketControlsProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
}

export default function MarketControls({ threshold, onThresholdChange }: MarketControlsProps) {
  const [sliderValue, setSliderValue] = React.useState([threshold]);
  const [isPaused, setIsPaused] = React.useState(false);
  const [globalSL, setGlobalSL] = React.useState('');
  const [isSLEnabled, setIsSLEnabled] = React.useState(false);

  React.useEffect(() => {
    setSliderValue([threshold]);
  }, [threshold]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
  };

  const handleCommit = (value: number[]) => {
    onThresholdChange(value[0]);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Market Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          <div className="space-y-4 pt-2">
            <Label htmlFor="dScoreThreshold">D-Score Threshold: <span className="text-primary font-bold">{sliderValue[0].toFixed(1)}</span></Label>
            <Slider
              id="dScoreThreshold"
              min={6}
              max={10}
              step={0.1}
              value={sliderValue}
              onValueChange={handleSliderChange}
              onValueCommit={handleCommit}
            />
             <p className="text-[0.8rem] text-muted-foreground">
                Filters the Market Overview table and the pairs available for new bot launches.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="space-y-4">
                <Label>Global Stop Loss</Label>
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                        <Label htmlFor="enable-gsl" className={cn(isSLEnabled && "text-destructive")}>
                            {isSLEnabled ? "Global SL Active" : "Set Global SL"}
                        </Label>
                         <p className="text-[0.8rem] text-muted-foreground">
                            {isSLEnabled ? `At $${parseFloat(globalSL || '0').toFixed(2)}` : "Close all if equity drops."}
                         </p>
                    </div>
                    <Switch
                        id="enable-gsl"
                        checked={isSLEnabled}
                        onCheckedChange={setIsSLEnabled}
                        aria-label="Toggle Global Stop Loss"
                    />
                </div>
                <Input 
                    id="global-sl-value" 
                    type="number" 
                    placeholder="e.g., -1000.00" 
                    value={globalSL}
                    onChange={(e) => setGlobalSL(e.target.value)}
                    disabled={!isSLEnabled}
                />
             </div>
             <div className="space-y-4">
                <Label>Emergency Actions</Label>
                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="pause-all" className={cn(isPaused && "text-destructive")}>
                                {isPaused ? "All Bots Paused" : "Pause All Bots"}
                            </Label>
                            <p className="text-[0.8rem] text-muted-foreground">
                                {isPaused ? "Trading is halted." : "Prevent new trades."}
                            </p>
                        </div>
                        <Switch
                            id="pause-all"
                            checked={isPaused}
                            onCheckedChange={setIsPaused}
                            aria-label="Pause all bots"
                        />
                    </div>
                     <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Close All Positions
                    </Button>
                </div>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
