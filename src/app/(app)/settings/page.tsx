
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <main className="flex min-h-[calc(100vh_-_theme(spacing.14))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold font-headline">Settings</h1>
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <Tabs defaultValue="preferences" orientation="vertical" className="sticky top-24">
            <TabsList className="flex-col h-auto items-start bg-transparent p-0 border-none">
                <TabsTrigger value="preferences" className="w-full justify-start data-[state=active]:bg-muted">Preferences</TabsTrigger>
                <TabsTrigger value="security" className="w-full justify-start data-[state=active]:bg-muted">Security</TabsTrigger>
            </TabsList>
        </Tabs>
        <div className="grid gap-6">
            <Tabs defaultValue="preferences" className="w-full">
                <TabsContent value="preferences">
                    {/* Preferences Content Here */}
                </TabsContent>
                <TabsContent value="security">
                    {/* Security Content Here */}
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </main>
  );
}
