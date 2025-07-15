import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Bot } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PauseCircle, PlayCircle, Settings2, Trash2 } from 'lucide-react';

interface BotCardProps {
  bot: Bot;
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

export default function BotCard({ bot }: BotCardProps) {
  const { status, profit_loss } = bot;
  const config = statusConfig[status];

  return (
    <Card>
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="font-headline">{bot.pair}</CardTitle>
          <CardDescription>{bot.strategy}</CardDescription>
        </div>
        <div className="flex items-center space-x-1 rounded-md text-secondary-foreground justify-end">
            <Badge variant="outline" className={cn("flex items-center gap-1.5", config.color)}>
                {config.label}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <span>D-Score Entry</span>
          </div>
          <span>{bot.d_score_entry}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <span>Entry Time</span>
          </div>
          <span>{new Date(bot.entry_time).toLocaleTimeString()}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold mt-2">
          <div className="flex items-center">
            <span>Live P/L</span>
          </div>
          <span className={cn(profit_loss >= 0 ? 'text-green-400' : 'text-red-400')}>
            ${profit_loss.toFixed(2)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="icon">
          {status === 'active' ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
          <span className="sr-only">{status === 'active' ? 'Pause' : 'Resume'}</span>
        </Button>
        <Button variant="outline" size="icon">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Adjust</span>
        </Button>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
