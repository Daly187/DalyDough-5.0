
'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PendingOrder, PendingOrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from '@/components/ui/scroll-area';
import { CircleDot, Newspaper, Clock, TrendingDown } from 'lucide-react';

interface PendingOrdersTableProps {
  orders: (PendingOrder & { pair: string; botId: string; })[];
}

const statusConfig: Record<PendingOrderStatus, { label: string; icon: React.ReactNode; color: string; }> = {
    PENDING: { label: "Pending", icon: <CircleDot className="h-3 w-3" />, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    BLOCKED_NEWS: { label: "News Block", icon: <Newspaper className="h-3 w-3" />, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    SLEEPING: { label: "Re-entry Delay", icon: <Clock className="h-3 w-3" />, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    PRICE_RETRACE: { label: "Price Retrace", icon: <TrendingDown className="h-3 w-3" />, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    D_SCORE_LOW: { label: "D-Score Low", icon: <TrendingDown className="h-3 w-3" />, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export default function PendingOrdersTable({ orders }: PendingOrdersTableProps) {
    
    const formatPrice = (price: number, pair: string) => {
        const pips = pair.includes('JPY') ? 3 : 5;
        return price.toFixed(pips);
    }

  return (
      <Card>
          <CardHeader>
              <CardTitle>All Pending Grid Orders</CardTitle>
              <CardDescription>
                  This table shows all the future trades your active bots are ready to place. The EA will execute these when the price reaches the target.
              </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[70vh] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pair</TableHead>
                    <TableHead>Bot ID</TableHead>
                    <TableHead>Grid Level</TableHead>
                    <TableHead>Target Price</TableHead>
                    <TableHead>Lot Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason / ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => {
                      const config = statusConfig[order.status];
                      return (
                        <TableRow key={`${order.botId}-${order.level}`}>
                            <TableCell className="font-medium">{order.pair}</TableCell>
                            <TableCell className="font-mono text-xs">{order.botId}</TableCell>
                            <TableCell>{order.level}</TableCell>
                            <TableCell className="font-semibold">{formatPrice(order.targetPrice, order.pair)}</TableCell>
                            <TableCell>{order.lotSize.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn("flex items-center gap-1.5 w-fit", config.color)}>
                                    {config.icon}
                                    {config.label}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                                Waiting for price action...
                            </TableCell>
                        </TableRow>
                      )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
  );
}
