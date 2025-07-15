import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { NewsEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NewsCalendarProps {
  events: NewsEvent[];
}

const impactColors = {
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function NewsCalendar({ events }: NewsCalendarProps) {
  return (
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
        {events.map((event) => (
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
  );
}
