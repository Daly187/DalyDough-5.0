
"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Rocket, HelpCircle, Lightbulb } from "lucide-react";
import type { DScore, Bot, PendingOrder, UserSettings } from "@/lib/types";
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { getForexData } from '@/lib/fmp';
import { useData } from '@/context/data-context';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Switch } from '../ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  const [selectedApiPair, setSelectedApiPair] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const { userSettings } = useData();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setConfig((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof typeof defaultConfig) => (value: string) => {
    setConfig((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: keyof typeof defaultConfig) => (checked: boolean) => {
    setConfig((prev) => ({ ...prev, [id]: checked }));
  };
  
  const handlePairSelectChange = (value: string) => {
    setSelectedApiPair(value);
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
    if (allPairs.length > 0 && !allPairs.find(p => p.pair === selectedApiPair)) {
      setSelectedApiPair(allPairs[0]?.pair || "");
    } else if (allPairs.length === 0) {
      setSelectedApiPair("");
    }
  }, [allPairs, selectedApiPair]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error" });
        setIsSubmitting(false);
        return;
    }

    if (!selectedApiPair) {
        toast({ variant: "destructive", title: "No Pair Selected" });
        setIsSubmitting(false);
        return;
    }

    const brokerSymbol = userSettings?.symbolMappings.find(m => m.apiSymbol === selectedApiPair)?.brokerSymbol;

    if (!brokerSymbol) {
        toast({ variant: "destructive", title: "Symbol Mapping Error", description: `Could not find broker symbol for ${selectedApiPair}.` });
        setIsSubmitting(false);
        return;
    }
    
    try {
        const dScoreData = await getForexData(selectedApiPair);
        if (!dScoreData) throw new Error("Could not fetch D-Score data.");

        const direction = dScoreData.dScore > 0 ? 'Buy' : 'Sell';
        const pipSize = selectedApiPair.includes('JPY') ? 0.01 : 0.0001;

        // The first trade is active, not pending. Subsequent trades are pending.
        const pendingOrders: PendingOrder[] = [];
        let currentLotSize = Number(config.lotSize);
        let cumulativeDistance = 0;

        // Loop starts from grid level 2 for PENDING orders
        for (let i = 2; i <= Number(config.gridLevels); i++) {
            currentLotSize *= Number(config.lotSizeMultiplier);
            
            // Adjust distance logic to start from the first pending order
            const distanceMultiplier = (config.gridDistanceMultiplier ?? 1.5) ** (i - 1);
            cumulativeDistance = i === 2 
                ? Number(config.gridDistance) 
                : cumulativeDistance + (Number(config.gridDistance) * distanceMultiplier);

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
        
        const newBotData: Omit<Bot, 'id'> = {
            ...config,
            uid: user.uid,
            pair: brokerSymbol, // Use broker symbol
            status: 'active',
            createdAt: serverTimestamp(),
            profit_loss: 0,
            strategy: config.botType,
            d_score_entry: dScoreData?.dScore ?? 0,
            direction: direction,
            pendingOrders: pendingOrders
        };

        const docRef = await addDoc(collection(db, "bots"), newBotData);

        toast({
            title: "Bot Launched Successfully!",
            description: `A ${config.botType} bot for ${brokerSymbol} has been created.`,
        });
    } catch (e) {
        toast({ variant: "destructive", title: "Failed to Launch Bot", description: (e as Error).message });
    } finally {
        setIsSubmitting(false);
    }
  };

  const TooltipLabel = ({ htmlFor, label, tooltipText }: { htmlFor: string, label: string, tooltipText: string }) => (
    <div className="flex items-center gap-2">
      <Label htmlFor={htmlFor} className="text-muted-foreground">{label}</Label>
      <TooltipProvider><Tooltip><TooltipTrigger>
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
      </TooltipTrigger><TooltipContent><p>{tooltipText}</p></TooltipContent></Tooltip></TooltipProvider>
    </div>
  );

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <Settings className="h-5 w-5" />
                Bot Configuration
            </CardTitle>
            <CardDescription>
                Configure and launch a bot that your EA can execute.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="pairSelect">Select Pair ({allPairs.length} available)</Label>
                 <Select value={selectedApiPair} onValueChange={handlePairSelectChange} disabled={isLoading || allPairs.length === 0}>
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
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="botType">Bot Type</Label>
                    <Select value={config.botType} onValueChange={handleSelectChange('botType')}>
                        <SelectTrigger id="botType"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Dynamic DCA">Dynamic DCA</SelectItem>
                            <SelectItem value="Trend Rider">Trend Rider</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="lotSize">Initial Lot Size</Label>
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
            </div>
             {config.aiOptimization && (
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>AI Optimization Enabled</AlertTitle>
                    <AlertDescription>
                        AI will dynamically adjust re-entry timing using Resistance/Support levels instead of a fixed pip distance.
                        The calculation identifies significant recent swing highs/lows in the price chart to determine more natural and effective re-entry points.
                    </AlertDescription>
                </Alert>
            )}
        </CardContent>
        <CardFooter>
            <Button className="w-full" disabled={isLoading || !selectedApiPair || isSubmitting} onClick={handleSubmit}>
                <Rocket className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Launching...' : 'Launch Bot'}
            </Button>
        </CardFooter>
    </Card>
  );
}
