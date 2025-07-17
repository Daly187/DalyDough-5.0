
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pause, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';

interface MarketControlsProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
}

export default function MarketControls({ threshold, onThresholdChange }: MarketControlsProps) {
  const [sliderValue, setSliderValue] = React.useState([threshold]);

  // Update slider when the prop changes
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
          
          <div className="space-y-2 col-span-1 md:col-span-1">
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

          <Separator orientation="vertical" className="hidden md:block h-16 mx-auto" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-span-1 md:col-span-1 items-end">
            <div className="space-y-2">
                <Label htmlFor="global-sl">Global Stop Loss ($)</Label>
                <div className="flex gap-2">
                    <Input id="global-sl" type="number" placeholder="-1000.00" />
                    <Button>Set</Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Emergency Actions</Label>
                <div className="flex gap-2">
                    <Button variant="secondary" className="w-full">
                        <Pause className="mr-2 h-4 w-4" />
                        Pause All
                    </Button>
                    <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Close All
                    </Button>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
