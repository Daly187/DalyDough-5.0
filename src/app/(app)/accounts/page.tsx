import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LinkedAccountsTable from "@/components/accounts/linked-accounts-table";
import LinkAccountForm from "@/components/accounts/link-account-form";
import { linkedAccountsData } from "@/lib/data";

export default function AccountsPage() {
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
          <LinkedAccountsTable accounts={linkedAccountsData} />
        </TabsContent>
        <TabsContent value="link" className="mt-4">
          <LinkAccountForm />
        </TabsContent>
      </Tabs>
    </main>
  );
}
