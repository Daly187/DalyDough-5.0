
'use client';
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
import SidebarNav from '@/components/sidebar-nav';
import Header from '@/components/header';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import React from 'react';

function AppLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-8 w-8 text-primary"><rect width="256" height="256" fill="none"/><path d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm-41.25,90.4a16,16,0,1,1,0,23.2,16,16,0,0,1,0-23.2Zm82.5,0a16,16,0,1,1,0,23.2,16,16,0,0,1,0-23.2ZM168,176H88a48,48,0,0,1,0-96h80a48,48,0,0,1,0,96Z" fill="currentColor"/></svg>
                </div>
                <p className="text-muted-foreground animate-pulse">Authenticating...</p>
            </div>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
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
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.photoURL || `https://placehold.co/40x40.png`} alt={user.displayName || 'User'} />
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{user.displayName}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} className="shrink-0">
                <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <AppLayoutContent>{children}</AppLayoutContent>
  )
}
