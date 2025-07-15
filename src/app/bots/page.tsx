
import ActiveBotsTable from '@/components/bots/active-bots-table';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { activeBotsData, closedBotsData, dScoreData } from '@/lib/data';
import { Pause, Power, ShieldAlert, Trash2 } from 'lucide-react';

export default function BotsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Bots Management</h1>
      </div>
      <div className="grid gap-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <ShieldAlert className="h-5 w-5" />
                    Global Controls
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </CardContent>
        </Card>

        <ActiveBotsTable data={activeBotsData} allPairs={dScoreData} title="Active Bots" description="Manage and monitor your currently running trade bots."/>
        <ActiveBotsTable data={closedBotsData} allPairs={dScoreData} title="Closed Bots" description="Review the performance of completed bot trades." isClosed={true} />
      </div>
    </main>
  );
}
