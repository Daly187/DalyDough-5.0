
'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle, Save, Loader2, KeyRound, Server, UserCog } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '@/lib/firebase/firestore';
import { auth } from '@/lib/firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

const symbolMappingSchema = z.object({
  mappings: z.array(z.object({
    brokerSymbol: z.string().min(1, 'Broker symbol is required.'),
    apiSymbol: z.string().min(1, 'API symbol is required.'),
    description: z.string().optional(),
  })),
});

type SymbolMappingFormData = z.infer<typeof symbolMappingSchema>;

function SymbolMappingForm() {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const { control, handleSubmit, reset } = useForm<SymbolMappingFormData>({
    resolver: zodResolver(symbolMappingSchema),
    defaultValues: { mappings: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mappings',
  });

  React.useEffect(() => {
    if (user) {
      setIsLoading(true);
      const docRef = doc(db, 'userSettings', user.uid);
      
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().symbolMappings && docSnap.data().symbolMappings.length > 0) {
          reset({ mappings: docSnap.data().symbolMappings });
        } else {
            // Set default values if no settings are found
            reset({ mappings: [
                { brokerSymbol: 'EURUSD', apiSymbol: 'EUR/USD', description: 'Euro vs US Dollar' },
                { brokerSymbol: 'USDJPY', apiSymbol: 'USD/JPY', description: 'US Dollar vs Japanese Yen' },
                { brokerSymbol: 'GBPUSD', apiSymbol: 'GBP/USD', description: 'Great Britain Pound vs US Dollar' },
            ] });
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching symbol mappings: ", error);
        toast({ variant: 'destructive', title: 'Error', description: "Could not load symbol mappings." });
        setIsLoading(false);
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    }
  }, [user, reset, toast]);

  const onSubmit = async (data: SymbolMappingFormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated' });
      return;
    }
    setIsSaving(true);
    try {
      const docRef = doc(db, 'userSettings', user.uid);
      await setDoc(docRef, { symbolMappings: data.mappings }, { merge: true });
      toast({ title: 'Success', description: 'Symbol mappings have been saved.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UserCog /> Symbol Mapping</CardTitle>
        <CardDescription>
          Map your broker's specific symbols (e.g., EURUSD.pro) to the standard API format (e.g., EUR/USD). This list is automatically populated by the EA.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                    <div>
                      <Label htmlFor={`mappings.${index}.brokerSymbol`}>Broker Symbol</Label>
                      <Controller
                        name={`mappings.${index}.brokerSymbol`}
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="e.g., EURUSD.pro" />}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`mappings.${index}.apiSymbol`}>API Symbol</Label>
                      <Controller
                        name={`mappings.${index}.apiSymbol`}
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="e.g., EUR/USD" />}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`mappings.${index}.description`}>Description</Label>
                      <Controller
                        name={`mappings.${index}.description`}
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="Symbol description" />}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(index)} className="self-end text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-between items-center pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => append({ brokerSymbol: '', apiSymbol: '', description: '' })}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Symbol Manually
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Mappings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.14))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold font-headline">Settings</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
        <Tabs defaultValue="symbols">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="symbols">Symbol Mapping</TabsTrigger>
                <TabsTrigger value="api_keys">API Keys</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="symbols" className="mt-6">
                <SymbolMappingForm />
            </TabsContent>
            <TabsContent value="api_keys" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>API Keys</CardTitle>
                        <CardDescription>Manage your third-party API keys.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* API Keys Management UI will go here */}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="security" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Manage your account security settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Security Management UI will go here */}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
