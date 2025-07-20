
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Loader2, AlertTriangle, KeyRound, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TradeAccount } from "@/lib/types";
import { db } from "@/lib/firebase/firestore";
import { doc, updateDoc, writeBatch, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const statusColors: Record<TradeAccount['status'], string> = {
  Connected: "bg-green-500/20 text-green-400 border-green-500/30",
  Connecting: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Disconnected: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Error: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface AccountRowProps {
  account: TradeAccount;
  isPrimary: boolean;
  onPrimaryChange: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

const AccountRow: React.FC<AccountRowProps> = ({ account, isPrimary, onPrimaryChange, onDelete }) => {
  const [localAccount, setLocalAccount] = React.useState(account);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setLocalAccount(account);
  }, [account]);

  const handleCopyToggle = (enabled: boolean) => {
    setLocalAccount(prev => ({ ...prev, copySettings: { ...prev.copySettings!, enabled } }));
  };

  const handleWeightChange = (weight: number) => {
    const newWeight = Math.max(0, weight);
    setLocalAccount(prev => ({ ...prev, copySettings: { ...prev.copySettings!, weight: newWeight } }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "tradeAccounts", localAccount.id);
      await updateDoc(docRef, {
        isPrimary: isPrimary,
        copySettings: localAccount.copySettings,
      });
      toast({ title: "Account Saved", description: `Settings for ${localAccount.nickname} updated.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(localAccount.id);
    // isDeleting will be reset by parent component re-render
  };

  const handleCopyKey = () => {
    if (account.eaKey) {
        navigator.clipboard.writeText(account.eaKey);
        toast({ title: "Copied!", description: "EA Key copied to clipboard." });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  return (
    <TableRow>
      <TableCell>
        <RadioGroupItem value={localAccount.id} id={`primary-${localAccount.id}`} checked={isPrimary} onClick={() => onPrimaryChange(localAccount.id)} />
      </TableCell>
      <TableCell className="font-medium">{localAccount.nickname}</TableCell>
      <TableCell className="font-mono">{localAccount.accountId}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span>{localAccount.eaKey ? `${localAccount.eaKey.substring(0, 8)}...` : 'N/A'}</span>
            {localAccount.eaKey && (
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyKey}>
                            <Copy className="h-3 w-3" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Copy EA Key</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
        </div>
      </TableCell>
      <TableCell>{localAccount.broker}</TableCell>
      <TableCell>{formatCurrency(localAccount.balance)}</TableCell>
      <TableCell>
        <Badge variant="outline" className={cn(statusColors[localAccount.status])}>
          {localAccount.status}
        </Badge>
      </TableCell>
      <TableCell>
        {!isPrimary && localAccount.copySettings ? (
          <Switch
            checked={localAccount.copySettings.enabled}
            onCheckedChange={handleCopyToggle}
          />
        ) : null}
      </TableCell>
      <TableCell>
        {!isPrimary && localAccount.copySettings ? (
          <Input
            type="number"
            step="0.01"
            min="0"
            value={localAccount.copySettings.weight}
            onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
            disabled={!localAccount.copySettings.enabled}
            className="w-24 h-8"
          />
        ) : null}
      </TableCell>
      <TableCell className="text-right">
         <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the account "{localAccount.nickname}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Yes, Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};


export default function LinkedAccountsTable({ accounts }: { accounts: TradeAccount[] }) {
  const [primaryAccountId, setPrimaryAccountId] = React.useState<string | undefined>(
    accounts.find(a => a.isPrimary)?.id
  );
  const { toast } = useToast();

  React.useEffect(() => {
    setPrimaryAccountId(accounts.find(a => a.isPrimary)?.id);
  }, [accounts]);
  
  const handlePrimaryChange = async (id: string) => {
    const batch = writeBatch(db);
    accounts.forEach(acc => {
      const docRef = doc(db, "tradeAccounts", acc.id);
      batch.update(docRef, { isPrimary: acc.id === id });
    });
    try {
      await batch.commit();
      setPrimaryAccountId(id);
      toast({ title: "Primary Account Updated", description: `New primary account has been set.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: (error as Error).message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "tradeAccounts", id));
        toast({ title: "Account Deleted", description: "The account has been successfully removed." });
    } catch (error) {
        toast({ variant: "destructive", title: "Deletion Failed", description: (error as Error).message });
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Trading Accounts</CardTitle>
        <CardDescription>
          Select a primary account and configure sub-accounts to copy its trades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={primaryAccountId}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Primary</TableHead>
                <TableHead>Nickname</TableHead>
                <TableHead>Account ID</TableHead>
                <TableHead>
                    <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        EA Key
                    </div>
                </TableHead>
                <TableHead>Broker</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Copy Trades</TableHead>
                <TableHead className="w-[120px]">Copy Weight</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {accounts.map((account) => (
                  <AccountRow 
                    key={account.id}
                    account={account}
                    isPrimary={account.id === primaryAccountId}
                    onPrimaryChange={handlePrimaryChange}
                    onDelete={handleDelete}
                  />
                ))}
            </TableBody>
          </Table>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
