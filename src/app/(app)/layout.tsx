
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signOut } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshProvider } from '@/context/refresh-context';
import { DataProvider } from '@/context/data-context';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: error.message,
      });
    } else {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="hidden flex-col gap-4 border-r bg-muted/40 p-2 md:flex md:w-[256px]">
            <div className="p-2 pt-4">
                <Skeleton className="h-8 w-40" />
            </div>
            <div className="flex flex-col gap-2 px-2">
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                ))}
            </div>
        </div>
        <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <Skeleton className="h-8 w-1/3" />
                 <div className="flex items-center gap-4 ml-auto">
                    <Skeleton className="h-8 w-32" />
                 </div>
            </header>
            <main className="flex-1 p-8">
                <Skeleton className="h-full w-full" />
            </main>
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
            <div className='w-full space-y-2'>
                <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
                <div className="flex items-center gap-3 border-t pt-2">
                    <Avatar>
                    <AvatarImage src={user?.photoURL ?? `https://placehold.co/40x40.png`} alt={user?.displayName ?? 'User'} />
                    <AvatarFallback>{user?.displayName?.charAt(0) ?? user?.email?.charAt(0) ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-foreground truncate">{user?.displayName ?? 'Welcome'}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DataProvider>
          <RefreshProvider>
            <Header />
            {children}
          </RefreshProvider>
        </DataProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
