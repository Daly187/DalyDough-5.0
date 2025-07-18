
"use client";

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Power, PowerOff, Target, XCircle } from 'lucide-react';
import type { Bot, DScore, AIReentry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiReentriesData } from '@/lib/data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Input } from '../ui/input';
import AiOptimizedReentries from '../autobot/ai-optimized-reentries';

interface ActiveBotsTableProps {
  data: Bot[];
  allPairs: DScore[];
  title: string;
  description: string;
  isClosed?: boolean;
}

const statusConfig: Record<Bot['status'] | 'unknown', { label: string; color: string; }> = {
    active: {
        label: "Active",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    paused: {
        label: "Paused",
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    error: {
        label: "Error",
        color: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    closed: {
        label: "Closed",
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    },
    close_at_tp: {
        label: "Close at TP",
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    unknown: {
        label: "Unknown",
        color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    }
}

const statusOptions = [
    { value: 'active', label: 'Active', icon: <Power className="h-4 w-4" /> },
    { value: 'close_at_tp', label: 'Close at TP', icon: <Target className="h-4 w-4" /> },
    { value: 'paused', label: 'Pause', icon: <PowerOff className="h-4 w-4" /> },
    { value: 'closed', label: 'Close Now', icon: <XCircle className="h-4 w-4" /> }
];


const BotRow = ({ bot, allPairs, isClosed }: { bot: Bot, allPairs: DScore[], isClosed: boolean }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [stopLoss, setStopLoss] = React.useState(bot.stopLoss ?? 50);
    const [takeProfit, setTakeProfit] = React.useState(bot.takeProfit ?? 100);
    const [botStatus, setBotStatus] = React.useState(bot.status);

    const getCurrentDScore = (pair: string) => {
        return allPairs.find(p => p.pair === pair)?.dScore;
    }
    
    const currentStatus = isClosed ? 'closed' : bot.status;
    const config = statusConfig[currentStatus] || statusConfig.unknown;
    const currentDScore = getCurrentDScore(bot.pair);

    return (
        <Collapsible asChild key={bot.id}>
            <>
                <TableRow className="align-middle">
                    {!isClosed && (
                         <TableCell>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-9 p-0 data-[state=open]:rotate-90">
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                        </TableCell>
                    )}
                    <TableCell className="font-medium">{bot.pair}</TableCell>
                    <TableCell>{bot.strategy}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={cn("flex items-center gap-1.5 w-fit", config.color)}>
                            {config.label}
                        </Badge>
                    </TableCell>
                    <TableCell className={cn(bot.profit_loss >= 0 ? 'text-green-400' : 'text-red-400')}>
                        {bot.profit_loss >= 0 ? '+' : ''}${bot.profit_loss.toFixed(2)}
                    </TableCell>
                    <TableCell className='text-yellow-400'>
                        ${bot.drawdown.toFixed(2)}
                    </TableCell>
                    <TableCell>{bot.d_score_entry.toFixed(1)}</TableCell>
                    <TableCell>{isClosed ? bot.d_score_exit?.toFixed(1) : currentDScore?.toFixed(1) ?? 'N/A'}</TableCell>
                    {isClosed && <TableCell></TableCell>}
                </TableRow>
                <CollapsibleContent asChild>
                    <TableRow>
                        <TableCell colSpan={8} className="p-0">
                            <div className="p-4 bg-muted/50">
                                <h4 className="font-bold text-lg mb-4">Manage Bot: {bot.pair}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <Label className="font-semibold">Status Control</Label>
                                        <RadioGroup value={botStatus} onValueChange={(value) => setBotStatus(value as Bot['status'])} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                            {statusOptions.map((option) => (
                                                <Label 
                                                    key={option.value}
                                                    htmlFor={`status-${bot.id}-${option.value}`}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                                        botStatus === option.value && "border-primary"
                                                    )}
                                                >
                                                    <RadioGroupItem value={option.value} id={`status-${bot.id}-${option.value}`} className="sr-only" />
                                                    {option.icon}
                                                    <span className="mt-2 text-sm font-medium">{option.label}</span>
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                        
                                        <Separator className="my-4" />

                                        <Label className="font-semibold">Trade Parameters</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor={`stopLoss-${bot.id}`}>Stop Loss ($)</Label>
                                                <Input id={`stopLoss-${bot.id}`} type="number" value={stopLoss} onChange={(e) => setStopLoss(parseFloat(e.target.value))} />
                                            </div>
                                            <div>
                                                <Label htmlFor={`takeProfit-${bot.id}`}>Take Profit ($)</Label>
                                                <Input id={`takeProfit-${bot.id}`} type="number" value={takeProfit} onChange={(e) => setTakeProfit(parseFloat(e.target.value))} />
                                            </div>
                                        </div>
                                         <Button className="w-full">Update Bot</Button>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="font-semibold">AI Optimized Re-entries</Label>
                                         <AiOptimizedReentries reentries={aiReentriesData} />
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </CollapsibleContent>
            </>
        </Collapsible>
    );
}


export default function ActiveBotsTable({ data, allPairs, title, description, isClosed = false }: ActiveBotsTableProps) {
  
  return (
      <Card>
          <CardHeader>
              <CardTitle className="font-headline">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[265px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {!isClosed && <TableHead className="w-[50px]">Expand</TableHead>}
                    <TableHead>Pair</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>P/L</TableHead>
                    <TableHead>Drawdown</TableHead>
                    <TableHead>Entry D-Score</TableHead>
                    <TableHead>{isClosed ? 'Exit D-Score' : 'Current D-Score'}</TableHead>
                    {isClosed && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((bot) => (
                    <BotRow key={bot.id} bot={bot} allPairs={allPairs} isClosed={isClosed} />
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
  );
}
