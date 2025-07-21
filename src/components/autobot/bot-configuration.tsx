
"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, Lightbulb, HelpCircle, Rocket } from "lucide-react";
import type { DScore, Bot, PendingOrder } from "@/lib/types";
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getForexData } from '@/lib/fmp';

const defaultConfig = {
    botType: 'Dynamic DCA',
    lotSize: 0.01,
    maxPositions: 5,
    reentryDelay: 15,
    stopLoss: 500,
    takeProfit: 100,
    enableDSizeExit: true,
    dSizeExitThreshold: 6.0,
    enableTrailingStop: false,
    trailingStopPips: 20,
    newsFilter: true,
    weekendTrading: false,
    aiOptimization: true,
    gridLevels: 5,
    gridDistance: 20,
    gridDistanceMultiplier: 1.5,
    lotSizeMultiplier: 1.5,
    takeProfitType: 'fixed' as 'fixed' | 'average',
    closeOnRetrace: false,
    retracePercentage: 50,
};


interface BotConfigurationProps {
  allPairs: DScore[];
  activeBots: Bot[];
  isLoading: boolean;
}

export default function BotConfiguration({ allPairs, activeBots, isLoading }: BotConfigurationProps) {
  const [config, setConfig] = React.useState(defaultConfig);
  const [selectedPair, setSelectedPair] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setConfig((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof typeof defaultConfig) => (value: string) => {
    setConfig((prev) => ({ ...prev, [id]: value }));
  };
  
  const handlePairSelectChange = (value: string) => {
    setSelectedPair(value);
  };

  const handleSwitchChange = (id: keyof typeof defaultConfig) => (checked: boolean) => {
    setConfig((prev) => ({ ...prev, [id]: checked }));
  };

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
    if (allPairs.length > 0 && !allPairs.find(p => p.pair === selectedPair)) {
      setSelectedPair(allPairs[0].pair);
    } else if (allPairs.length === 0) {
      setSelectedPair("");
    }
  }, [allPairs, selectedPair]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to launch a bot.",
        });
        setIsSubmitting(false);
        return;
    }

    if (!selectedPair) {
        toast({
            variant: "destructive",
            title: "No Pair Selected",
            description: "Please select a currency pair to launch a bot.",
        });
        setIsSubmitting(false);
        return;
    }
    
    try {
        const dScoreData = await getForexData(selectedPair);
        
        if (!dScoreData || !dScoreData.price) {
            throw new Error("Could not fetch D-Score data or price for the selected pair.");
        }

        const direction = dScoreData.dScore > 0 ? 'Buy' : 'Sell';
        const pipSize = selectedPair.includes('JPY') ? 0.01 : 0.0001;
        
        // Calculate pending orders
        const pendingOrders: PendingOrder[] = [];
        let currentLotSize = Number(config.lotSize);
        let currentGridDistance = Number(config.gridDistance);
        let cumulativeDistance = 0;

        for (let i = 1; i <= config.gridLevels; i++) {
            if (i > 1) {
                currentLotSize *= Number(config.lotSizeMultiplier);
                currentGridDistance *= Number(config.gridDistanceMultiplier);
            }
            
            cumulativeDistance += currentGridDistance;
            const priceOffset = cumulativeDistance * pipSize;
            const targetPrice = direction === 'Buy' 
                ? dScoreData.price - priceOffset 
                : dScoreData.price + priceOffset;

            pendingOrders.push({
                level: i,
                targetPrice: parseFloat(targetPrice.toFixed(5)),
                lotSize: parseFloat(currentLotSize.toFixed(2)),
                status: 'PENDING'
            });
        }

        const docRef = await addDoc(collection(db, "bots"), {
            ...config,
            pair: selectedPair,
            status: 'active',
            createdAt: serverTimestamp(),
            profit_loss: 0,
            strategy: config.botType || "DCA Grid",
            d_score_entry: dScoreData?.dScore ?? 0,
            direction: direction,
            uid: user.uid,
            pendingOrders: pendingOrders,
        });

        toast({
            title: "Bot Launched Successfully!",
            description: `Your bot for ${selectedPair} has been created with ID: ${docRef.id}`,
        });
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Failed to Launch Bot",
            description: (e as Error).message || "An unknown error occurred.",
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
          Bot Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <div>
                <Label htmlFor="pairSelect">Select Pair ({allPairs.length} available)</Label>
                 <Select value={selectedPair} onValueChange={handlePairSelectChange} disabled={isLoading || allPairs.length === 0}>
                    <SelectTrigger id="pairSelect">
                        <SelectValue placeholder={isLoading ? "Loading pairs..." : "Select a high-scoring pair"} />
                    </SelectTrigger>
                    <SelectContent>
                        {allPairs.map(p => (
                            <SelectItem key={p.id} value={p.pair}>
                                {p.pair} (D: {p.dScore.toFixed(1)}, Bots: {activeBotCounts[p.pair] || 0})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="buy_and_hold">Buy and Hold</SelectItem>
                            <SelectItem value="sell_and_hold">Sell and Hold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="initialLotOrder">Initial Lot Order</Label>
                    <Input id="lotSize" type="number" value={config.lotSize} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="gridLevels">Grid Levels</Label>
                    <Input id="gridLevels" type="number" value={config.gridLevels} onChange={handleInputChange} />
                </div>
                 <div>
                    <Label htmlFor="gridDistance">Grid Distance (pips)</Label>
                    <Input id="gridDistance" type="number" value={config.gridDistance} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="lotSizeMultiplier">Lot Size Multiplier</Label>
                    <Input id="lotSizeMultiplier" type="number" value={config.lotSizeMultiplier} onChange={handleInputChange} />
                </div>
                 <div>
                    <Label htmlFor="gridDistanceMultiplier">Grid Distance Multiplier</Label>
                    <Input id="gridDistanceMultiplier" type="number" value={config.gridDistanceMultiplier} onChange={handleInputChange} />
                </div>
                 <div>
                    <Label htmlFor="maxPositions">Max Positions</Label>
                    <Input id="maxPositions" type="number" value={config.maxPositions} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="takeProfitType">Take Profit Type</Label>
                    <Select value={config.takeProfitType} onValueChange={handleSelectChange('takeProfitType')}>
                        <SelectTrigger id="takeProfitType">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                            <SelectItem value="average">Average Price (pips)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="takeProfit">Take Profit Value</Label>
                    <Input id="takeProfit" type="number" value={config.takeProfit} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="stopLoss">Stop Loss ($)</Label>
                    <Input id="stopLoss" type="number" value={config.stopLoss} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="reentryDelay">Re-entry Delay (mins)</Label>
                    <Input id="reentryDelay" type="number" value={config.reentryDelay} onChange={handleInputChange} />
                </div>
            </div>
            
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                     <TooltipLabel 
                        htmlFor="enableDSizeExit" 
                        label="D-Size Exit Threshold" 
                        tooltipText="If enabled, the bot will stop opening new trades and close at the next Take Profit if the absolute D-Size falls below this value." 
                    />
                     <div className="flex items-center gap-2">
                        <Switch id="enableDSizeExit" checked={config.enableDSizeExit} onCheckedChange={handleSwitchChange('enableDSizeExit')} />
                        <Input 
                            id="dSizeExitThreshold" 
                            type="number" 
                            value={config.dSizeExitThreshold} 
                            onChange={handleInputChange} 
                            disabled={!config.enableDSizeExit}
                            className="w-24"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <TooltipLabel 
                        htmlFor="enableTrailingStop" 
                        label="Enable Trailing Stop" 
                        tooltipText="Automatically adjusts the stop loss as the trade moves in your favor." 
                    />
                    <div className="flex items-center gap-2">
                        <Switch id="enableTrailingStop" checked={config.enableTrailingStop} onCheckedChange={handleSwitchChange('enableTrailingStop')} />
                        <Input 
                            id="trailingStopPips" 
                            type="number" 
                            value={config.trailingStopPips} 
                            onChange={handleInputChange} 
                            disabled={!config.enableTrailingStop}
                            className="w-24"
                            placeholder="pips"
                        />
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <TooltipLabel 
                        htmlFor="closeOnRetrace" 
                        label="Close on Retrace" 
                        tooltipText="Close the entire grid if price retraces a certain percentage from its furthest point." 
                    />
                     <div className="flex items-center gap-2">
                        <Switch id="closeOnRetrace" checked={config.closeOnRetrace} onCheckedChange={handleSwitchChange('closeOnRetrace')} />
                        <Input 
                            id="retracePercentage" 
                            type="number" 
                            value={config.retracePercentage} 
                            onChange={handleInputChange} 
                            disabled={!config.closeOnRetrace}
                            className="w-24"
                            placeholder="%"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <TooltipLabel 
                        htmlFor="newsFilter" 
                        label="News Filter" 
                        tooltipText="Prevents opening new trades around high-impact news events." 
                    />
                    <Switch id="newsFilter" checked={config.newsFilter} onCheckedChange={handleSwitchChange('newsFilter')} />
                </div>
                <div className="flex items-center justify-between">
                    <TooltipLabel 
                        htmlFor="weekendTrading" 
                        label="Weekend Trading" 
                        tooltipText="Allows the bot to continue running and opening trades over the weekend." 
                    />
                    <Switch id="weekendTrading" checked={config.weekendTrading} onCheckedChange={handleSwitchChange('weekendTrading')} />
                </div>
                 <div className="flex items-center justify-between">
                    <TooltipLabel 
                        htmlFor="aiOptimization" 
                        label="AI Optimization" 
                        tooltipText="Enables advanced AI features for enhanced decision-making." 
                    />
                    <Switch id="aiOptimization" checked={config.aiOptimization} onCheckedChange={handleSwitchChange('aiOptimization')} />
                </div>
            </div>
        </div>
         {config.aiOptimization && (
            <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>How AI Optimization Works</AlertTitle>
                <AlertDescription>
                    <p className="font-semibold text-foreground">Optimal R/S Re-entry:</p>
                    <p className="text-xs text-muted-foreground">Instead of fixed pip distances, the AI identifies the nearest significant support (for buys) or resistance (for sells) levels based on recent price action (swing highs/lows). Grid orders are then placed at these dynamically calculated levels, resulting in more natural and effective entry points.</p>
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={isLoading || !selectedPair || isSubmitting} onClick={handleSubmit}>
            <Rocket className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Launching...' : 'Launch Bot'}
        </Button>
      </CardFooter>
    </Card>
  );
}
