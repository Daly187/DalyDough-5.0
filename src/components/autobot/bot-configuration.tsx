
"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Rocket } from "lucide-react";
import type { DScore, Bot } from "@/lib/types";
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getForexData } from '@/lib/fmp';

// Simplified config for the current EA capabilities
const defaultConfig = {
    lotSize: 0.01,
    stopLoss: 0, // SL/TP handled by EA or manually for now
    takeProfit: 0,
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
  
  const handlePairSelectChange = (value: string) => {
    setSelectedPair(value);
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
      setSelectedPair(allPairs[0]?.pair || "");
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
        
        if (!dScoreData) {
            throw new Error("Could not fetch D-Score data for the selected pair.");
        }

        // Determine strategy based on D-Score, aligning with EA logic
        const strategy = dScoreData.dScore > 0 ? 'buy_and_hold' : 'sell_and_hold';

        const newBotData = {
            uid: user.uid,
            pair: selectedPair,
            status: 'active',
            createdAt: serverTimestamp(),
            profit_loss: 0,
            d_score_entry: dScoreData?.dScore ?? 0,
            lotSize: Number(config.lotSize),
            strategy: strategy, // This is what the EA looks for
            // Other complex fields are omitted as the EA doesn't use them yet
        };

        const docRef = await addDoc(collection(db, "bots"), newBotData);

        toast({
            title: "Bot Launched Successfully!",
            description: `A ${strategy} bot for ${selectedPair} has been created.`,
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

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <Settings className="h-5 w-5" />
                Bot Configuration
            </CardTitle>
            <CardDescription>
                Configure and launch a simple bot that your EA can execute.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
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
            <div className="space-y-2">
                <Label htmlFor="lotSize">Lot Size</Label>
                <Input id="lotSize" type="number" value={config.lotSize} onChange={handleInputChange} />
            </div>
             <CardDescription>
                Stop Loss and Take Profit are not yet supported from the web UI. Please manage them in your MT5 terminal.
            </CardDescription>
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
