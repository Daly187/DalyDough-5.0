"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, Play, Scan } from 'lucide-react';
import type { BotScannerData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { botScannerData as initialData } from '@/lib/data';

export default function AutoBotScanner() {
    const [scannerData, setScannerData] = React.useState<BotScannerData>(initialData);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setScannerData(prev => ({ ...prev, [id]: parseFloat(value) }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setScannerData(prev => ({ ...prev, autoLaunch: checked }));
    };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Bot className="h-6 w-6" /> Auto Bot Scanner
                </CardTitle>
                <CardDescription>Your 24/7 trading assistant.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <span className={cn("text-xs font-semibold", scannerData.autoLaunch ? "text-green-400" : "text-yellow-400")}>
                    {scannerData.autoLaunch ? 'Enabled' : 'Disabled'}
                </span>
                <Switch checked={scannerData.autoLaunch} onCheckedChange={handleSwitchChange} />
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="minDSize">Min D-Size</Label>
                <Input id="minDSize" type="number" value={scannerData.minDSize} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="maxDSize">Max D-Size</Label>
                <Input id="maxDSize" type="number" value={scannerData.maxDSize} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss (pips)</Label>
                <Input id="stopLoss" type="number" value={scannerData.stopLoss} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="takeProfit">Take Profit (pips)</Label>
                <Input id="takeProfit" type="number" value={scannerData.takeProfit} onChange={handleInputChange} />
            </div>
        </div>
        <div className="space-y-2">
            <Label>Monitored Pairs</Label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {scannerData.pairs.map(pair => (
                    <Badge key={pair} variant="secondary">{pair}</Badge>
                ))}
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline">
            <Scan className="mr-2 h-4 w-4" />
            Force Scan
        </Button>
        <Button>
            <Play className="mr-2 h-4 w-4" />
            Launch Best
        </Button>
      </CardFooter>
    </Card>
  );
}
