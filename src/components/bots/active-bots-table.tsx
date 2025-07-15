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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PauseCircle, PlayCircle, Settings2, Trash2, ChevronsRight } from 'lucide-react';
import type { Bot } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ActiveBotsTableProps {
  data: Bot[];
}

const statusConfig = {
    active: {
        label: "Active",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <PauseCircle className="h-4 w-4" />
    },
    paused: {
        label: "Paused",
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <PlayCircle className="h-4 w-4" />
    },
    error: {
        label: "Error",
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <Settings2 className="h-4 w-4" />
    },
}

export default function ActiveBotsTable({ data }: ActiveBotsTableProps) {
  return (
    <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pair</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>P/L</TableHead>
                <TableHead>Entry D-Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((bot) => {
                const config = statusConfig[bot.status];
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
                        ${bot.profit_loss.toFixed(2)}
                    </TableCell>
                    <TableCell>{bot.d_score_entry}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm">
                          Manage <ChevronsRight className="h-4 w-4 ml-2" />
                       </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
}
