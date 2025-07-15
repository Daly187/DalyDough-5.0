"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { NewsEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";

interface NewsCalendarProps {
  events: NewsEvent[];
  currencies: string[];
  impacts: string[];
}

const impactColors = {
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function NewsCalendar({ events, currencies, impacts }: NewsCalendarProps) {
  const [selectedCurrency, setSelectedCurrency] = React.useState('all');
  const [selectedImpact, setSelectedImpact] = React.useState('all');

  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      const currencyMatch = selectedCurrency === 'all' || event.currency === selectedCurrency;
      const impactMatch = selectedImpact === 'all' || event.impact.toLowerCase() === selectedImpact;
      return currencyMatch && impactMatch;
    });
  }, [events, selectedCurrency, selectedImpact]);

  return (
    <div className="space-y-4">
        <div className="flex gap-4">
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Currency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Currencies</SelectItem>
                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={selectedImpact} onValueChange={setSelectedImpact}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Impact" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Impacts</SelectItem>
                    {impacts.map(i => <SelectItem key={i} value={i.toLowerCase()}>{i}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <ScrollArea className="h-[500px]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Actual</TableHead>
                        <TableHead>Forecast</TableHead>
                        <TableHead>Previous</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                        <TableCell>{event.time}</TableCell>
                        <TableCell>{event.currency}</TableCell>
                        <TableCell>
                        <Badge variant="outline" className={cn(impactColors[event.impact])}>
                            {event.impact}
                        </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{event.event}</TableCell>
                        <TableCell>{event.actual ?? '-'}</TableCell>
                        <TableCell>{event.forecast ?? '-'}</TableCell>
                        <TableCell>{event.previous ?? '-'}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    </div>
  );
}
