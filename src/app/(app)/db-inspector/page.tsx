

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DbInspectorPage() {

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
            This page is for admin use. To view data, you must update security rules to grant your admin user read access to the entire 'bots' collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Configuration Required</AlertTitle>
                <AlertDescription>
                    <p>Fetching all bot documents is disabled by default for security reasons.</p>
                    <p className="mt-2">To enable this view, you must:</p>
                    <ol className="list-decimal list-inside mt-1">
                        <li>Modify your Firestore security rules to grant your specific admin user ID read access to the '/bots/{botId}' path.</li>
                        <li>Update the `getBots()` server action in `src/app/actions.ts` to be callable without a `uid` for your admin user.</li>
                    </ol>
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    </main>
  );
}
