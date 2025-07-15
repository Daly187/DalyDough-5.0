import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/toaster';
import SidebarNav from '@/components/sidebar-nav';
import Header from '@/components/header';

export const metadata: Metadata = {
  title: 'DalyDough',
  description: 'Next-Gen Forex Automation Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <SidebarProvider defaultOpen={false}>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <div className="flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-8 w-8 text-primary"><rect width="256" height="256" fill="none"/><path d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm-41.25,90.4a16,16,0,1,1,0,23.2,16,16,0,0,1,0-23.2Zm82.5,0a16,16,0,1,1,0,23.2,16,16,0,0,1,0-23.2ZM168,176H88a48,48,0,0,1,0-96h80a48,48,0,0,1,0,96Z" fill="currentColor"/></svg>
                <h1 className="text-2xl font-headline font-semibold text-primary">DalyDough</h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40.png" alt="@trader" />
                  <AvatarFallback>T</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">John Trader</span>
                  <span className="text-xs text-muted-foreground">john.trader@email.com</span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <Header />
            {children}
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
