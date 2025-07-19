
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
import { Power, PowerOff, Target, XCircle, Save, TrendingUp, TrendingDown, Hourglass } from 'lucide-react';
import type { Bot, DScore } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


interface ActiveBotsTableProps {
  data: Bot[];
  allPairs: DScore[];
  title: string;
  description: string;
  isClosed?: boolean;
}

const statusConfig: Record<Bot['status'] | 'unknown', { label: string; color: string; }> = {
    active: { label: "Active", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    paused: { label: "Paused", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    error: { label: "Error", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    closed: { label: "Closed", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
    close_at_tp: { label: "Close at TP", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    unknown: { label: "Unknown", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
}

const BotRow = ({ bot, allPairs, isClosed }: { bot: Bot, allPairs: DScore[], isClosed?: boolean }) => {
    const [stopLoss, setStopLoss] = React.useState(bot.stopLoss ?? 50);
    const [takeProfit, setTakeProfit] = React.useState(bot.takeProfit ?? 100);
    const [dScoreExitThreshold, setDScoreExitThreshold] = React.useState(bot.dSizeExitThreshold ?? 6.0);
    const [botStatus, setBotStatus] = React.useState(bot.status);

    const getCurrentDScore = (pair: string) => allPairs.find(p => p.pair === pair)?.dScore;
    
    const currentStatus = isClosed ? 'closed' : botStatus;
    const config = statusConfig[currentStatus] || statusConfig.unknown;
    const currentDScore = getCurrentDScore(bot.pair);

    const direction = bot.direction || (bot.d_score_entry > 0 ? 'Buy' : 'Sell');

    const getDScoreExitStatus = () => {
        if (isClosed || !currentDScore || !bot.enableDSizeExit) {
            return { text: 'N/A', color: 'text-muted-foreground', icon: null };
        }
        
        const exitThreshold = Math.abs(dScoreExitThreshold);
        let shouldExit = false;

        if (direction === 'Buy' && currentDScore < exitThreshold) {
            shouldExit = true;
        } else if (direction === 'Sell' && currentDScore > -exitThreshold) {
            shouldExit = true;
        }
        
        if (shouldExit) {
             return { text: 'Close at TP', color: 'text-yellow-400', icon: <Hourglass className="h-3 w-3" /> };
        }
        
        return { text: `Armed at ${direction === 'Buy' ? '' : '-'}${exitThreshold}`, color: 'text-green-400', icon: <Target className="h-3 w-3" /> };
    };

    const dScoreExitStatus = getDScoreExitStatus();

    return (
        <TableRow key={bot.id}>
            <TableCell className="font-medium">{bot.pair}</TableCell>
            <TableCell>{bot.strategy}</TableCell>
            <TableCell>
                 <Badge variant="outline" className={cn("flex items-center gap-1.5 w-fit", config.color)}>
                    {config.label}
                </Badge>
            </TableCell>
            <TableCell>
                 <div className={cn("flex items-center gap-2 font-semibold", direction === 'Buy' ? 'text-green-400' : 'text-red-400')}>
                    {direction === 'Buy' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{direction}</span>
                </div>
            </TableCell>
            <TableCell className={cn(bot.profit_loss >= 0 ? 'text-green-400' : 'text-red-400')}>
                {bot.profit_loss >= 0 ? '+' : ''}${bot.profit_loss.toFixed(2)}
            </TableCell>
            <TableCell>{typeof bot.d_score_entry === 'number' ? bot.d_score_entry.toFixed(1) : 'N/A'}</TableCell>
            <TableCell>{isClosed ? bot.d_score_exit?.toFixed(1) ?? 'N/A' : currentDScore?.toFixed(1) ?? 'N/A'}</TableCell>
            {!isClosed && (
                <>
                    <TableCell>
                        <Input 
                            type="number" 
                            className="w-24 h-8"
                            value={stopLoss} 
                            onChange={(e) => setStopLoss(parseFloat(e.target.value))} 
                        />
                    </TableCell>
                    <TableCell>
                        <Input 
                            type="number" 
                            className="w-24 h-8"
                            value={takeProfit} 
                            onChange={(e) => setTakeProfit(parseFloat(e.target.value))} 
                        />
                    </TableCell>
                     <TableCell>
                        <Input 
                            type="number" 
                            className="w-24 h-8"
                            value={dScoreExitThreshold} 
                            onChange={(e) => setDScoreExitThreshold(parseFloat(e.target.value))}
                            disabled={!bot.enableDSizeExit}
                        />
                    </TableCell>
                    <TableCell>
                        <div className={cn("flex items-center gap-1.5 text-xs font-medium", dScoreExitStatus.color)}>
                           {dScoreExitStatus.icon} {dScoreExitStatus.text}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Select value={botStatus} onValueChange={(value) => setBotStatus(value as Bot['status'])}>
                            <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="Set Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Pause</SelectItem>
                                <SelectItem value="close_at_tp">Close at TP</SelectItem>
                                <SelectItem value="close_now">Close Now</SelectItem>
                            </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2">
                             <Button variant="outline" size="sm" className="h-8">
                                <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" className="h-8">
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </>
            )}
        </TableRow>
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
            <ScrollArea className="h-[265px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pair</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>P/L</TableHead>
                    <TableHead>Entry D-Score</TableHead>
                    <TableHead>{isClosed ? 'Exit D-Score' : 'Current D-Score'}</TableHead>
                    {!isClosed && (
                        <>
                            <TableHead>Stop Loss</TableHead>
                            <TableHead>Take Profit</TableHead>
                            <TableHead>Exit Threshold</TableHead>
                            <TableHead>Exit Status</TableHead>
                            <TableHead>Control</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </>
                    )}
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
