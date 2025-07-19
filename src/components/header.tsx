
"use client";

import { useRefresh } from '@/context/refresh-context';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { RefreshCw, Bell, Bot, Settings, PowerOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationData } from '@/lib/data';
import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


const notificationIcons: { [key in Notification['type']]: React.ReactNode } = {
  new_bot: <Bot className="h-4 w-4 text-green-500" />,
  status_change: <Settings className="h-4 w-4 text-blue-500" />,
  bot_closed: <PowerOff className="h-4 w-4 text-red-500" />,
};

export default function Header() {
  const { triggerRefresh } = useRefresh();

  const handleRefresh = () => {
    triggerRefresh();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger className="flex md:hidden" />
      <div className="flex w-full items-center justify-between">
        <div className="flex gap-6 text-sm">
            <div>
                <span className="text-muted-foreground">P/L Summary: </span>
                <span className="font-semibold text-green-400">+$6,101.75</span>
            </div>
            <div>
                <span className="text-muted-foreground">Account Equity: </span>
                <span className="font-semibold text-foreground">$543,025.70</span>
            </div>
            <div>
                <span className="text-muted-foreground">Account Balance: </span>
                <span className="font-semibold text-foreground">$482,011.95</span>
            </div>
            <div>
                <span className="text-muted-foreground">Margin Usage: </span>
                <span className="font-semibold text-orange-400">745.8%</span>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
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
