
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
import { ChevronsRight, HelpCircle } from 'lucide-react';
import type { Bot, DScore } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import ManageBotSheet from './manage-bot-sheet';
import { aiReentriesData } from '@/lib/data';

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

export default function ActiveBotsTable({ data, allPairs, title, description, isClosed = false }: ActiveBotsTableProps) {
  const [selectedBot, setSelectedBot] = React.useState<Bot | null>(null);

  const handleManageClick = (bot: Bot) => {
    setSelectedBot(bot);
  };
  
  const getCurrentDScore = (pair: string) => {
    return allPairs.find(p => p.pair === pair)?.dScore;
  }

  return (
    <>
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
                    <TableHead>Pair</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>P/L</TableHead>
                    <TableHead>Drawdown</TableHead>
                    <TableHead>Entry D-Score</TableHead>
                    <TableHead>{isClosed ? 'Exit D-Score' : 'Current D-Score'}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((bot) => {
                    const currentStatus = isClosed ? 'closed' : bot.status;
                    const config = statusConfig[currentStatus] || statusConfig.unknown;
                    return (
                      <TableRow key={bot.id}>
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
                        <TableCell>{isClosed ? bot.d_score_exit?.toFixed(1) : getCurrentDScore(bot.pair)?.toFixed(1) ?? 'N/A'}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="sm" onClick={() => !isClosed && handleManageClick(bot)}>
                              {isClosed ? 'Analyze' : 'Manage'} <ChevronsRight className="h-4 w-4 ml-2" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
        <ManageBotSheet
          isOpen={!!selectedBot}
          onOpenChange={(open) => !open && setSelectedBot(null)}
          botData={selectedBot}
          reentries={aiReentriesData}
          currentDScore={getCurrentDScore(selectedBot?.pair || '')}
        />
    </>
  );
}
