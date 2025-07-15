
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
import { ArrowRight, Power, PowerOff, Target, XCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';

interface ManageBotSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  botData: Bot | null;
  reentries: AIReentry[];
  currentDScore?: number;
}

const statusOptions = [
    { value: 'active', label: 'Active', icon: <Power className="h-4 w-4" /> },
    { value: 'close_at_tp', label: 'Close at TP', icon: <Target className="h-4 w-4" /> },
    { value: 'paused', label: 'Pause', icon: <PowerOff className="h-4 w-4" /> },
    { value: 'closed', label: 'Close Now', icon: <XCircle className="h-4 w-4" /> }
];

export default function ManageBotSheet({ isOpen, onOpenChange, botData, reentries, currentDScore }: ManageBotSheetProps) {
  const [stopLoss, setStopLoss] = React.useState(botData?.stopLoss ?? 0);
  const [takeProfit, setTakeProfit] = React.useState(botData?.takeProfit ?? 0);
  const [botStatus, setBotStatus] = React.useState(botData?.status ?? 'active');

  React.useEffect(() => {
    if (botData) {
        setStopLoss(botData.stopLoss ?? 50);
        setTakeProfit(botData.takeProfit ?? 100);
        setBotStatus(botData.status);
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
            <RadioGroup value={botStatus} onValueChange={(value) => setBotStatus(value as Bot['status'])} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                 {statusOptions.map((option) => (
                    <Label 
                        key={option.value}
                        htmlFor={`status-${option.value}`}
                        className={cn(
                            "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            botStatus === option.value && "border-primary"
                        )}
                    >
                        <RadioGroupItem value={option.value} id={`status-${option.value}`} className="sr-only" />
                        {option.icon}
                        <span className="mt-2 text-sm font-medium">{option.label}</span>
                    </Label>
                ))}
            </RadioGroup>

            <Separator />

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
