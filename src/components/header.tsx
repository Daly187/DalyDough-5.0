
"use client";

import * as React from 'react';
import { useRefresh } from '@/context/refresh-context';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { Bell, Bot, Settings, PowerOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationData } from '@/lib/data';
import type { Notification, TradeAccount, Bot as BotType } from '@/lib/types';
import { format } from 'date-fns';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

const notificationIcons: { [key in Notification['type']]: React.ReactNode } = {
  new_bot: <Bot className="h-4 w-4 text-green-500" />,
  status_change: <Settings className="h-4 w-4 text-blue-500" />,
  bot_closed: <PowerOff className="h-4 w-4 text-red-500" />,
};

const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '$0.00';
    const sign = value >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


export default function Header() {
  const { refreshKey } = useRefresh();
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [user] = useAuthState(auth);
  const [primaryAccount, setPrimaryAccount] = React.useState<TradeAccount | null>(null);
  const [bots, setBots] = React.useState<BotType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setLastUpdated(new Date());
  }, [refreshKey]);
  
  React.useEffect(() => {
    if (user) {
        setIsLoading(true);
        // Listener for trade accounts
        const accountsQuery = query(collection(db, "tradeAccounts"), where("uid", "==", user.uid));
        const unsubscribeAccounts = onSnapshot(accountsQuery, (snapshot) => {
            const userAccounts: TradeAccount[] = [];
            snapshot.forEach((doc) => {
                userAccounts.push({ id: doc.id, ...doc.data() } as TradeAccount);
            });
            const primary = userAccounts.find(acc => acc.isPrimary) || userAccounts[0] || null;
            setPrimaryAccount(primary);
            setIsLoading(false);
        });

        // Listener for bots to calculate P/L
        const botsQuery = query(collection(db, "bots"), where("uid", "==", user.uid), where("status", "==", "active"));
        const unsubscribeBots = onSnapshot(botsQuery, (snapshot) => {
            const activeBots: BotType[] = [];
            snapshot.forEach((doc) => {
                activeBots.push({ id: doc.id, ...doc.data() } as BotType);
            });
            setBots(activeBots);
        });

        return () => {
            unsubscribeAccounts();
            unsubscribeBots();
        };
    } else {
        setIsLoading(false);
        setPrimaryAccount(null);
        setBots([]);
    }
  }, [user]);

  const totalPL = bots.reduce((sum, bot) => sum + bot.profit_loss, 0);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger className="flex md:hidden" />
      <div className="flex w-full items-center justify-between">
        {isLoading ? (
            <div className="flex gap-6 text-sm items-center">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
            </div>
        ) : (
            <div className="flex gap-6 text-sm items-center">
                {primaryAccount && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Primary: </span>
                      <span className="font-semibold text-primary">{primaryAccount.nickname}</span>
                    </div>
                    <div className="h-6 w-px bg-border" />
                    <div>
                        <span className="text-muted-foreground">Equity: </span>
                        <span className="font-semibold text-foreground">${primaryAccount.equity?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                     <div>
                        <span className="text-muted-foreground">Balance: </span>
                        <span className="font-semibold text-foreground">${primaryAccount.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}
                 <div>
                    <span className="text-muted-foreground">Open P/L: </span>
                    <span className={`font-semibold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(totalPL)}</span>
                </div>
            </div>
        )}
        <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground">
              Last API Pull: {format(lastUpdated, 'HH:mm:ss')}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4 w-4" />
                   <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {notificationData.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex items-start gap-3">
                       <div className="mt-1">
                        {notificationIcons[notification.type]}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">{notification.timestamp}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
