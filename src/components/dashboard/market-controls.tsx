
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';

interface MarketControlsProps {
  thresholds: { lower: number, upper: number };
  onThresholdChange: (values: { lower: number, upper: number }) => void;
}

export default function MarketControls({ thresholds, onThresholdChange }: MarketControlsProps) {
  const [lowerSlider, setLowerSlider] = React.useState([thresholds.lower]);
  const [upperSlider, setUpperSlider] = React.useState([thresholds.upper]);
  const [isPaused, setIsPaused] = React.useState(false);
  const [globalSL, setGlobalSL] = React.useState('');
  const [isSLEnabled, setIsSLEnabled] = React.useState(false);

  React.useEffect(() => {
    setLowerSlider([thresholds.lower]);
    setUpperSlider([thresholds.upper]);
  }, [thresholds]);

  const handleCommit = () => {
    onThresholdChange({ lower: lowerSlider[0], upper: upperSlider[0] });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Market Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          <div className="space-y-4 pt-2">
            <Label>D-Score Thresholds</Label>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="dScoreLower" className="text-sm text-muted-foreground">Sell Signal &lt; <span className="font-bold text-red-400">{lowerSlider[0].toFixed(1)}</span></Label>
                    <Slider
                        id="dScoreLower"
                        min={-10}
                        max={0}
                        step={0.1}
                        value={lowerSlider}
                        onValueChange={setLowerSlider}
                        onValueCommit={handleCommit}
                        className="[&>span>span]:bg-red-400"
                    />
                </div>
                 <div>
                    <Label htmlFor="dScoreUpper" className="text-sm text-muted-foreground">Buy Signal &gt; <span className="font-bold text-green-400">{upperSlider[0].toFixed(1)}</span></Label>
                    <Slider
                        id="dScoreUpper"
                        min={0}
                        max={10}
                        step={0.1}
                        value={upperSlider}
                        onValueChange={setUpperSlider}
                        onValueCommit={handleCommit}
                        className="[&>span>span]:bg-green-400"
                    />
                </div>
            </div>
             <p className="text-[0.8rem] text-muted-foreground">
                Filter for pairs with a D-Score less than the sell threshold or greater than the buy threshold.
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
