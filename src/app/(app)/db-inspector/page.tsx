
import { getBots } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from "@/lib/types";
import { Database } from "lucide-react";

export default async function DbInspectorPage() {
  const { success, data: botsData, error } = await getBots();
  const allBots: Bot[] = success ? (botsData as Bot[]) : [];

  if (!success) {
    console.error("Failed to fetch bots:", error);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold font-headline">Database Inspector</h1>
          <p className="text-muted-foreground">A raw JSON view of the 'bots' collection in Firestore.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bots Collection Data</CardTitle>
          <CardDescription>
            This is the live data your MT5 Expert Advisor will interact with. Use this structure as a reference.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh] w-full rounded-md border bg-muted/50 p-4">
            <pre className="text-sm text-foreground">
              {JSON.stringify(allBots, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  );
}
