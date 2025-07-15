import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pause, ShieldAlert, Trash2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger className="flex md:hidden" />
      <div className="flex w-full items-center justify-between">
        <div className="hidden md:flex gap-6 text-sm">
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
        <div className="flex items-center gap-4">
             <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Global Controls
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none font-headline">Global Controls</h4>
                            <p className="text-sm text-muted-foreground">
                                High-level management for all bot activities.
                            </p>
                        </div>
                         <div className="grid gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Emergency Actions</Label>
                                <div className="flex gap-2">
                                    <Button variant="destructive" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Close All Bots
                                    </Button>
                                    <Button variant="secondary" className="w-full">
                                        <Pause className="mr-2 h-4 w-4" />
                                        Pause All Bots
                                    </Button>
                                </div>
                            </div>
                             <div className="flex flex-col gap-2">
                                <Label htmlFor="global-sl">Global Stop Loss ($)</Label>
                                <div className="flex gap-2">
                                    <Input id="global-sl" type="number" placeholder="-1000.00" />
                                    <Button>Set</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
      </div>
    </header>
  );
}
