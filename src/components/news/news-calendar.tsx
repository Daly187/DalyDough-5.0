
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { NewsEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { format, parseISO } from 'date-fns';

interface NewsCalendarProps {
  events: NewsEvent[];
  currencies: string[];
  impacts: string[];
}

const impactColors: { [key: string]: string } = {
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
  Medium: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const processEvents = (events: NewsEvent[]) => {
    return events.map(event => {
        try {
            const dateObj = parseISO(event.date);
            return {
                ...event,
                displayDate: format(dateObj, 'EEEE, MMM dd'),
                displayTime: format(dateObj, 'h:mmaa')
            }
        } catch (e) {
            return {
                ...event,
                displayDate: 'Invalid Date',
                displayTime: 'N/A'
            }
        }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export default function NewsCalendar({ events, currencies, impacts }: NewsCalendarProps) {
  const [selectedCurrency, setSelectedCurrency] = React.useState('all');
  const [selectedImpact, setSelectedImpact] = React.useState('all');

  const groupedEvents = React.useMemo(() => {
    const processed = processEvents(events);
    
    const filteredEvents = processed.filter(event => {
      const currencyMatch = selectedCurrency === 'all' || event.currency === selectedCurrency;
      const impactMatch = selectedImpact === 'all' || event.impact === selectedImpact;
      return currencyMatch && impactMatch;
    });

    return filteredEvents.reduce((acc, event) => {
      const dateKey = event.displayDate;
      if (dateKey) {
        (acc[dateKey] = acc[dateKey] || []).push(event);
      }
      return acc;
    }, {} as Record<string, typeof processed>);

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
                    {impacts.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <ScrollArea className="h-[75vh]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Date</TableHead>
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
                  {Object.keys(groupedEvents).map(date => (
                      <React.Fragment key={date}>
                          {groupedEvents[date].map((event, index) => (
                              <TableRow key={`${event.date}-${event.eventName}`}>
                                  {index === 0 && (
                                      <TableCell rowSpan={groupedEvents[date].length} className="align-top font-semibold text-foreground">
                                          {date}
                                      </TableCell>
                                  )}
                                  <TableCell>{event.displayTime}</TableCell>
                                  <TableCell>{event.currency}</TableCell>
                                  <TableCell>
                                      <Badge variant="outline" className={cn(impactColors[event.impact ?? 'Low'])}>
                                          {event.impact}
                                      </Badge>
                                  </TableCell>
                                  <TableCell className="font-medium">{event.eventName}</TableCell>
                                  <TableCell>{event.actual ?? '–'}</TableCell>
                                  <TableCell>{event.estimate ?? '–'}</TableCell>
                                  <TableCell>{event.previous ?? '–'}</TableCell>
                              </TableRow>
                          ))}
                      </React.Fragment>
                  ))}
                </TableBody>
            </Table>
        </ScrollArea>
    </div>
  );
}
