import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
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
        <div className="flex items-center gap-4">
            {/* Global controls popover removed */}
        </div>
      </div>
    </header>
  );
}
