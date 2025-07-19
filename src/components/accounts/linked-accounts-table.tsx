
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TradeAccount } from "@/lib/types";

interface LinkedAccountsTableProps {
  accounts: TradeAccount[];
}

const statusColors: Record<TradeAccount['status'], string> = {
  Connected: "bg-green-500/20 text-green-400 border-green-500/30",
  Disconnected: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Error: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function LinkedAccountsTable({ accounts: initialAccounts }: LinkedAccountsTableProps) {
  const [accounts, setAccounts] = React.useState(initialAccounts);
  const [primaryAccountId, setPrimaryAccountId] = React.useState(
    initialAccounts.find(a => a.isPrimary)?.id ?? initialAccounts[0]?.id
  );

  const handlePrimaryChange = (id: string) => {
    setPrimaryAccountId(id);
    setAccounts(prev => prev.map(acc => ({
      ...acc,
      isPrimary: acc.id === id,
    })));
  };

  const handleCopyToggle = (id: string, enabled: boolean) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, copySettings: { ...acc.copySettings!, enabled } } : acc
    ));
  };

  const handleWeightChange = (id: string, weight: number) => {
    const newWeight = Math.max(0, weight);
     setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, copySettings: { ...acc.copySettings!, weight: newWeight } } : acc
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Trading Accounts</CardTitle>
        <CardDescription>
          Select a primary account and configure sub-accounts to copy its trades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={primaryAccountId} onValueChange={handlePrimaryChange}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Primary</TableHead>
                <TableHead>Nickname</TableHead>
                <TableHead>Account ID</TableHead>
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
                  <TableRow key={account.id}>
                    <TableCell>
                      <RadioGroupItem value={account.id} id={`primary-${account.id}`} />
                    </TableCell>
                    <TableCell className="font-medium">{account.nickname}</TableCell>
                    <TableCell>{account.id}</TableCell>
                    <TableCell>{account.broker}</TableCell>
                    <TableCell>{formatCurrency(account.balance)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(statusColors[account.status])}>
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!account.isPrimary && account.copySettings ? (
                        <Switch
                          checked={account.copySettings.enabled}
                          onCheckedChange={(checked) => handleCopyToggle(account.id, checked)}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {!account.isPrimary && account.copySettings ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={account.copySettings.weight}
                          onChange={(e) => handleWeightChange(account.id, parseFloat(e.target.value))}
                          disabled={!account.copySettings.enabled}
                          className="w-24 h-8"
                        />
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon">
                              <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
