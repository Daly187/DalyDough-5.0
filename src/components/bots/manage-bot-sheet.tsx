"use client";

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import type { Bot, AIReentry } from '@/lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import AiOptimizedReentries from '../autobot/ai-optimized-reentries';
import { ArrowRight } from 'lucide-react';

interface ManageBotSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  botData: Bot | null;
  reentries: AIReentry[];
  currentDScore?: number;
}

export default function ManageBotSheet({ isOpen, onOpenChange, botData, reentries, currentDScore }: ManageBotSheetProps) {
  const [stopLoss, setStopLoss] = React.useState(botData?.stopLoss ?? 0);
  const [takeProfit, setTakeProfit] = React.useState(botData?.takeProfit ?? 0);

  React.useEffect(() => {
    if (botData) {
        setStopLoss(botData.stopLoss ?? 50);
        setTakeProfit(botData.takeProfit ?? 100);
    }
  }, [botData]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader className="text-left">
          <SheetTitle className="font-headline text-2xl">Manage Bot: {botData?.pair}</SheetTitle>
          <SheetDescription>
            Adjust live parameters for this bot. Strategy: {botData?.strategy}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
            <div className="flex justify-around bg-muted/50 p-4 rounded-lg text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Entry D-Score</p>
                    <p className="text-2xl font-bold text-primary">{botData?.d_score_entry.toFixed(1)}</p>
                </div>
                <div className='flex items-center'>
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Current D-Score</p>
                    <p className="text-2xl font-bold text-primary">{currentDScore?.toFixed(1) ?? 'N/A'}</p>
                </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Trade Parameters</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="stopLoss">Stop Loss ($)</Label>
                        <Input id="stopLoss" type="number" value={stopLoss} onChange={(e) => setStopLoss(parseFloat(e.target.value))} />
                    </div>
                    <div>
                        <Label htmlFor="takeProfit">Take Profit ($)</Label>
                        <Input id="takeProfit" type="number" value={takeProfit} onChange={(e) => setTakeProfit(parseFloat(e.target.value))} />
                    </div>
                </div>
            </div>

            <Separator />
            
            <AiOptimizedReentries reentries={reentries} />
            
        </div>
        <SheetFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button>Update Bot</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
