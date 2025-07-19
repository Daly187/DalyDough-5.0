
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
import { Save, Target, TrendingUp, TrendingDown, Hourglass, XCircle, AlertTriangle } from 'lucide-react';
import type { Bot, DScore } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { db, doc, updateDoc } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRefresh } from '@/context/refresh-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
    close_now: { label: "Close Now", color: "bg-red-500/20 text-red-400 border-red-500/30" }, // For immediate action
    unknown: { label: "Unknown", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" }
}

const BotRow = ({ bot, allPairs, isClosed }: { bot: Bot, allPairs: DScore[], isClosed?: boolean }) => {
    const { toast } = useToast();
    const { triggerRefresh } = useRefresh();
    const [isSaving, setIsSaving] = React.useState(false);

    // Local state for editable fields, initialized from bot props
    const [editableFields, setEditableFields] = React.useState({
        stopLoss: bot.stopLoss ?? 50,
        takeProfit: bot.takeProfit ?? 100,
        dSizeExitThreshold: bot.dSizeExitThreshold ?? 6.0,
    });

    const handleFieldChange = (field: keyof typeof editableFields, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setEditableFields(prev => ({ ...prev, [field]: numValue }));
        }
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const botRef = doc(db, 'bots', bot.id);
            await updateDoc(botRef, {
                stopLoss: editableFields.stopLoss,
                takeProfit: editableFields.takeProfit,
                dSizeExitThreshold: editableFields.dSizeExitThreshold,
            });
            toast({ title: "Bot Updated", description: `Settings for ${bot.pair} have been saved.` });
            triggerRefresh();
        } catch (error) {
            toast({ variant: 'destructive', title: "Update Failed", description: (error as Error).message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: Bot['status']) => {
        try {
            const botRef = doc(db, 'bots', bot.id);
            await updateDoc(botRef, { status: newStatus });
            toast({ title: "Status Updated", description: `${bot.pair} bot is now ${newStatus}.` });
            triggerRefresh();
        } catch (error) {
            toast({ variant: 'destructive', title: "Status Update Failed", description: (error as Error).message });
        }
    };

    const handleCloseNow = async () => {
        await handleStatusChange('closed');
    };

    const getCurrentDScore = (pair: string) => allPairs.find(p => p.pair === pair)?.dScore;
    
    const config = statusConfig[bot.status] || statusConfig.unknown;
    const currentDScore = getCurrentDScore(bot.pair);

    const direction = bot.direction || (bot.d_score_entry > 0 ? 'Buy' : 'Sell');

    const getDScoreExitStatus = () => {
        if (isClosed || !currentDScore || !bot.enableDSizeExit) {
            return { text: 'N/A', color: 'text-muted-foreground', icon: null };
        }
        
        const exitThreshold = Math.abs(editableFields.dSizeExitThreshold);
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
                            value={editableFields.stopLoss} 
                            onChange={(e) => handleFieldChange('stopLoss', e.target.value)} 
                        />
                    </TableCell>
                    <TableCell>
                        <Input 
                            type="number" 
                            className="w-24 h-8"
                            value={editableFields.takeProfit} 
                            onChange={(e) => handleFieldChange('takeProfit', e.target.value)}
                        />
                    </TableCell>
                     <TableCell>
                        <Input 
                            type="number" 
                            className="w-24 h-8"
                            value={editableFields.dSizeExitThreshold} 
                            onChange={(e) => handleFieldChange('dSizeExitThreshold', e.target.value)}
                            disabled={!bot.enableDSizeExit}
                        />
                    </TableCell>
                    <TableCell>
                        <div className={cn("flex items-center gap-1.5 text-xs font-medium", dScoreExitStatus.color)}>
                           {dScoreExitStatus.icon} {dScoreExitStatus.text}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Select value={bot.status} onValueChange={(value) => handleStatusChange(value as Bot['status'])}>
                            <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="Set Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Pause</SelectItem>
                                <SelectItem value="close_at_tp">Close at TP</SelectItem>
                            </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-2">
                             <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleUpdate} disabled={isSaving}>
                                <Save className={cn("h-4 w-4", isSaving && "animate-spin")} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="h-8 w-8">
                                    <XCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action will immediately close the bot for {bot.pair}. This cannot be undone and will realize any current profit or loss.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleCloseNow}>Yes, Close Bot</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
