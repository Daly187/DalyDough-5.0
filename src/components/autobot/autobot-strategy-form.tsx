
"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, Lightbulb, HelpCircle, Save, SlidersHorizontal, Loader2 } from "lucide-react";
import type { AutoBotStrategy } from "@/lib/types";
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Slider } from '../ui/slider';

interface AutoBotStrategyFormProps {
  initialStrategy: AutoBotStrategy;
}

export default function AutoBotStrategyForm({ initialStrategy }: AutoBotStrategyFormProps) {
  const [strategy, setStrategy] = React.useState(initialStrategy);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numValue = parseFloat(value);
    setStrategy((prev) => ({ ...prev, [id]: isNaN(numValue) ? value : numValue }));
  };

  const handleSelectChange = (id: keyof AutoBotStrategy) => (value: string) => {
    setStrategy((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: keyof AutoBotStrategy) => (checked: boolean) => {
    setStrategy((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        const response = await fetch('/api/autobot/strategy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(strategy),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Failed to save strategy");
        }
        toast({
          title: "Strategy Saved",
          description: "Your Auto Bot strategy has been updated.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Error Saving Strategy",
            description: (error as Error).message,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const TooltipLabel = ({ htmlFor, label, tooltipText }: { htmlFor: string, label: string, tooltipText: string }) => (
    <div className="flex items-center gap-2">
      <Label htmlFor={htmlFor} className="text-muted-foreground">{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
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
        <CardTitle className="flex items-center gap-2 font-headline">
          <Settings className="h-5 w-5" />
          Strategy Template
        </CardTitle>
        <CardDescription>
            This configuration will be applied to all bots created automatically by the scanner.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* D-Score Thresholds */}
        <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                <h3 className="font-semibold">D-Score Entry Rules</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="entryThresholdLower">Sell Signal &lt; <span className="font-bold text-red-400">{strategy.entryThresholdLower?.toFixed(1)}</span></Label>
                    <Slider
                        id="entryThresholdLower" min={-10} max={0} step={0.1}
                        value={[strategy.entryThresholdLower ?? -7.0]} 
                        onValueChange={(val) => setStrategy(s => ({...s, entryThresholdLower: val[0]}))}
                        className="[&>span>span]:bg-red-400"
                    />
                </div>
                <div>
                    <Label htmlFor="entryThresholdUpper">Buy Signal &gt; <span className="font-bold text-green-400">{strategy.entryThresholdUpper?.toFixed(1)}</span></Label>
                    <Slider
                        id="entryThresholdUpper" min={0} max={10} step={0.1}
                        value={[strategy.entryThresholdUpper ?? 7.0]} 
                        onValueChange={(val) => setStrategy(s => ({...s, entryThresholdUpper: val[0]}))}
                        className="[&>span>span]:bg-green-400"
                    />
                </div>
            </div>
        </div>
        
        <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">D-Score Exit Rules</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="exitThresholdLower">Exit Sell when &gt; <span className="font-bold text-red-400">{strategy.exitThresholdLower?.toFixed(1)}</span></Label>
                    <Slider
                        id="exitThresholdLower" min={-10} max={0} step={0.1}
                        value={[strategy.exitThresholdLower ?? -6.0]} 
                        onValueChange={(val) => setStrategy(s => ({...s, exitThresholdLower: val[0]}))}
                        className="[&>span>span]:bg-red-400/70"
                    />
                </div>
                <div>
                    <Label htmlFor="exitThresholdUpper">Exit Buy when &lt; <span className="font-bold text-green-400">{strategy.exitThresholdUpper?.toFixed(1)}</span></Label>
                    <Slider
                        id="exitThresholdUpper" min={0} max={10} step={0.1}
                        value={[strategy.exitThresholdUpper ?? 6.0]} 
                        onValueChange={(val) => setStrategy(s => ({...s, exitThresholdUpper: val[0]}))}
                        className="[&>span>span]:bg-green-400/70"
                    />
                </div>
            </div>
             <p className="text-[0.8rem] text-muted-foreground pt-2">
                If an active bot's D-Score crosses these thresholds, it will be set to 'Close at Next TP' and will not re-enter.
            </p>
        </div>


        {/* Bot Configuration */}
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="botType">Bot Type</Label>
                    <Select value={strategy.botType} onValueChange={handleSelectChange('botType')}>
                        <SelectTrigger id="botType"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Dynamic DCA">Dynamic DCA</SelectItem>
                            <SelectItem value="Trend Rider">Trend Rider</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="lotSize">Initial Lot Size</Label>
                    <Input id="lotSize" type="number" value={strategy.lotSize} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="gridLevels">Grid Levels</Label>
                    <Input id="gridLevels" type="number" value={strategy.gridLevels} onChange={handleInputChange} />
                </div>
                 <div>
                    <Label htmlFor="gridDistance">Grid Distance (pips)</Label>
                    <Input id="gridDistance" type="number" value={strategy.gridDistance} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="lotSizeMultiplier">Lot Size Multiplier</Label>
                    <Input id="lotSizeMultiplier" type="number" value={strategy.lotSizeMultiplier} onChange={handleInputChange} />
                </div>
                 <div>
                    <Label htmlFor="maxPositions">Max Positions</Label>
                    <Input id="maxPositions" type="number" value={strategy.maxPositions} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="takeProfitType">Take Profit Type</Label>
                    <Select value={strategy.takeProfitType} onValueChange={handleSelectChange('takeProfitType')}>
                        <SelectTrigger id="takeProfitType"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                            <SelectItem value="average">Average Price (pips)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="takeProfit">Take Profit Value</Label>
                    <Input id="takeProfit" type="number" value={strategy.takeProfit} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="stopLoss">Stop Loss ($)</Label>
                    <Input id="stopLoss" type="number" value={strategy.stopLoss} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="reentryDelay">Re-entry Delay (mins)</Label>
                    <Input id="reentryDelay" type="number" value={strategy.reentryDelay} onChange={handleInputChange} />
                </div>
            </div>
            
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <TooltipLabel 
                        htmlFor="enableTrailingStop" 
                        label="Enable Trailing Stop" 
                        tooltipText="Automatically adjusts the stop loss as the trade moves in your favor." 
                    />
                    <div className="flex items-center gap-2">
                        <Switch id="enableTrailingStop" checked={strategy.enableTrailingStop} onCheckedChange={handleSwitchChange('enableTrailingStop')} />
                        <Input 
                            id="trailingStopPips" type="number" value={strategy.trailingStopPips} 
                            onChange={handleInputChange} disabled={!strategy.enableTrailingStop}
                            className="w-24" placeholder="pips"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <TooltipLabel 
                        htmlFor="newsFilter" 
                        label="News Filter" 
                        tooltipText="Prevents opening new trades around high-impact news events." 
                    />
                    <Switch id="newsFilter" checked={strategy.newsFilter} onCheckedChange={handleSwitchChange('newsFilter')} />
                </div>
                 <div className="flex items-center justify-between">
                    <TooltipLabel 
                        htmlFor="aiOptimization" 
                        label="AI Optimization" 
                        tooltipText="Enables advanced AI features for enhanced decision-making." 
                    />
                    <Switch id="aiOptimization" checked={strategy.aiOptimization} onCheckedChange={handleSwitchChange('aiOptimization')} />
                </div>
            </div>
        </div>
         {strategy.aiOptimization && (
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>AI Optimization Enabled</AlertTitle>
                <AlertDescription>
                   AI will dynamically adjust re-entry timing and lot sizing based on volatility and sentiment.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Saving...' : 'Save Auto Bot Strategy'}
        </Button>
      </CardFooter>
    </Card>
  );
}
