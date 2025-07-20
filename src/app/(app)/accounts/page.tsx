
'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LinkedAccountsTable from "@/components/accounts/linked-accounts-table";
import LinkAccountForm from "@/components/accounts/link-account-form";
import type { TradeAccount } from "@/lib/types";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/firestore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountsPage() {
  const [user] = useAuthState(auth);
  const [accounts, setAccounts] = React.useState<TradeAccount[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      setIsLoading(true);
      const q = query(collection(db, "tradeAccounts"), where("uid", "==", user.uid));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userAccounts: TradeAccount[] = [];
        querySnapshot.forEach((doc) => {
          userAccounts.push({ id: doc.id, ...doc.data() } as TradeAccount);
        });
        setAccounts(userAccounts);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching accounts: ", error);
        setIsLoading(false);
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleAccountAdded = (newAccount: TradeAccount) => {
    setAccounts(prev => [...prev, newAccount]);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Account Management</h1>
      </div>
      <Tabs defaultValue="manage">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="manage">Manage Accounts</TabsTrigger>
          <TabsTrigger value="link">Link New Account</TabsTrigger>
        </TabsList>
        <TabsContent value="manage" className="mt-4">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <LinkedAccountsTable accounts={accounts} />
          )}
        </TabsContent>
        <TabsContent value="link" className="mt-4">
          <LinkAccountForm onAccountAdded={handleAccountAdded} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
