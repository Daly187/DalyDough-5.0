
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pause, Play, Trash2 } from 'lucide-react';
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
  const [isSLSet, setIsSLSet] = React.useState(false);

  React.useEffect(() => {
    setSliderValue([threshold]);
  }, [threshold]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
  };

  const handleCommit = (value: number[]) => {
    onThresholdChange(value[0]);
  };

  const handleSLSet = () => {
    if (globalSL) {
      setIsSLSet(true);
    }
  }

  const handleSLClear = () => {
    setIsSLSet(false);
    setGlobalSL('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Market Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          
          <div className="space-y-2 col-span-1">
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
          </div>

          <Separator orientation="vertical" className="hidden md:block h-24 mx-auto" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 col-span-1 md:col-span-2">
             <div className="space-y-4">
                <Label>Emergency Actions</Label>
                <div className="space-y-4">
                    <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Close All Positions
                    </Button>
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
                </div>
             </div>
             <div className="space-y-4">
                <Label>Global Stop Loss</Label>
                {isSLSet ? (
                     <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                           <p className="text-sm text-muted-foreground">Active at</p>
                           <p className="font-semibold text-destructive">${parseFloat(globalSL).toFixed(2)}</p>
                        </div>
                         <Button variant="ghost" onClick={handleSLClear}>Clear</Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Input 
                          id="global-sl" 
                          type="number" 
                          placeholder="-1000.00" 
                          value={globalSL}
                          onChange={(e) => setGlobalSL(e.target.value)}
                        />
                        <Button onClick={handleSLSet} disabled={!globalSL}>Set</Button>
                    </div>
                )}
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
