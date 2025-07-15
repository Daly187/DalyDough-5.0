"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, Lightbulb } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { BotConfigurationData, DScore, Bot } from "@/lib/types";

interface BotConfigurationProps {
  config: BotConfigurationData;
  allPairs: DScore[];
  activeBots: Bot[];
}

export default function BotConfiguration({ config: initialConfig, allPairs, activeBots }: BotConfigurationProps) {
  const [config, setConfig] = React.useState(initialConfig);
  const [minDSize, setMinDSize] = React.useState(7.0);
  const [selectedPair, setSelectedPair] = React.useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setConfig((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof BotConfigurationData) => (value: string) => {
    setConfig((prev) => ({ ...prev, [id]: value }));
  };
  
  const handlePairSelectChange = (value: string) => {
    setSelectedPair(value);
  };

  const handleSwitchChange = (id: keyof BotConfigurationData) => (checked: boolean) => {
    setConfig((prev) => ({ ...prev, [id]: checked }));
  };
  
  const handleSliderChange = (value: number[]) => {
    setMinDSize(value[0]);
  };

  const filteredPairs = React.useMemo(() => {
    return allPairs.filter(p => p.dScore >= minDSize);
  }, [allPairs, minDSize]);

  const activeBotCounts = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    for (const bot of activeBots) {
        if (bot.status === 'active') {
            counts[bot.pair] = (counts[bot.pair] || 0) + 1;
        }
    }
    return counts;
  }, [activeBots]);


  React.useEffect(() => {
    if (filteredPairs.length > 0 && !filteredPairs.find(p => p.pair === selectedPair)) {
      setSelectedPair(filteredPairs[0].pair);
    } else if (filteredPairs.length === 0) {
      setSelectedPair("");
    }
  }, [filteredPairs, selectedPair]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Settings className="h-5 w-5" />
          Bot Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <div>
                <Label htmlFor="minDSize">Min D-Size: <span className="text-primary font-bold">{minDSize.toFixed(1)}</span></Label>
                <Slider id="minDSize" min={6} max={10} step={0.1} defaultValue={[minDSize]} onValueChange={handleSliderChange} />
            </div>
            <div>
                <Label htmlFor="pairSelect">Select Pair ({filteredPairs.length} available)</Label>
                 <Select value={selectedPair} onValueChange={handlePairSelectChange}>
                    <SelectTrigger id="pairSelect">
                        <SelectValue placeholder="Select a high-scoring pair" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredPairs.map(p => (
                            <SelectItem key={p.id} value={p.pair}>
                                {p.pair} (D: {p.dScore.toFixed(1)}, Bots: {activeBotCounts[p.pair] || 0})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="botType">Bot Type</Label>
                <Select value={config.botType} onValueChange={handleSelectChange('botType')}>
                    <SelectTrigger id="botType">
                        <SelectValue placeholder="Select bot type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Dynamic DCA">Dynamic DCA</SelectItem>
                        <SelectItem value="Trend Rider">Trend Rider</SelectItem>
                        <SelectItem value="Mean Reversion">Mean Reversion</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Label htmlFor="initialInvestment">Initial Investment ($)</Label>
                <Input id="initialInvestment" type="number" value={config.initialInvestment} onChange={handleInputChange} />
            </div>
             <div>
                <Label htmlFor="initialLotOrder">Initial Lot Order</Label>
                <Input id="initialLotOrder" type="number" value={config.lotSize} onChange={handleInputChange} />
            </div>
            <div>
                <Label htmlFor="maxPositions">Max Positions</Label>
                <Input id="maxPositions" type="number" value={config.maxPositions} onChange={handleInputChange} />
            </div>
            <div>
                <Label htmlFor="stopLoss">Stop Loss (pips)</Label>
                <Input id="stopLoss" type="number" value={config.stopLoss} onChange={handleInputChange} />
            </div>
            <div>
                <Label htmlFor="takeProfit">Take Profit (pips)</Label>
                <Input id="takeProfit" type="number" value={config.takeProfit} onChange={handleInputChange} />
            </div>
             <div>
                <Label htmlFor="maxDrawdown">Max Drawdown (%)</Label>
                <Input id="maxDrawdown" type="number" value={config.maxDrawdown} onChange={handleInputChange} />
            </div>
            <div>
                <Label htmlFor="dailyLossLimit">Daily Loss Limit ($)</Label>
                <Input id="dailyLossLimit" type="number" value={config.dailyLossLimit} onChange={handleInputChange} />
            </div>
            <div className="flex items-center justify-between col-span-1 md:col-span-2">
                <Label htmlFor="enableTrailingStop">Enable Trailing Stop</Label>
                <Switch id="enableTrailingStop" checked={config.enableTrailingStop} onCheckedChange={handleSwitchChange('enableTrailingStop')} />
            </div>
             <div>
                <Label htmlFor="dSizeExitThreshold">D-Size Exit Threshold</Label>
                <Input id="dSizeExitThreshold" type="number" value={config.dSizeExitThreshold} onChange={handleInputChange} />
            </div>
             <div>
                <Label htmlFor="reentryDelay">Re-entry Delay (mins)</Label>
                <Input id="reentryDelay" type="number" value={config.reentryDelay} onChange={handleInputChange} />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="newsFilter">News Filter</Label>
                <Switch id="newsFilter" checked={config.newsFilter} onCheckedChange={handleSwitchChange('newsFilter')} />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="weekendTrading">Weekend Trading</Label>
                <Switch id="weekendTrading" checked={config.weekendTrading} onCheckedChange={handleSwitchChange('weekendTrading')} />
            </div>
             <div className="flex items-center justify-between col-span-1 md:col-span-2">
                <Label htmlFor="aiOptimization">AI Optimization</Label>
                <Switch id="aiOptimization" checked={config.aiOptimization} onCheckedChange={handleSwitchChange('aiOptimization')} />
            </div>
        </div>
         {config.aiOptimization && (
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>AI Optimization Features:</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground">
                        <li>Dynamic R/S level detection for optimal re-entry timing</li>
                        <li>Real-time sentiment analysis integration</li>
                        <li>Adaptive lot sizing based on market volatility</li>
                        <li>Smart exit timing using momentum indicators</li>
                        <li>News impact assessment for position sizing</li>
                    </ul>
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
