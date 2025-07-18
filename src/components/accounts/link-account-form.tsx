"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, Download, KeyRound, RefreshCw, Server } from "lucide-react";

export default function LinkAccountForm() {
    const [apiKey, setApiKey] = React.useState('');

    const generateApiKey = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setApiKey(result);
    };

    React.useEffect(() => {
        generateApiKey();
    }, []);

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Server className="h-5 w-5" />
                        Link Trading Account
                    </CardTitle>
                    <CardDescription>Connect your MT4 or MT5 account to start trading.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nickname">Account Nickname</Label>
                        <Input id="nickname" placeholder="e.g., Main Profit Account" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="platform">Platform</Label>
                        <Select>
                            <SelectTrigger id="platform">
                                <SelectValue placeholder="Select Platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mt4">MetaTrader 4</SelectItem>
                                <SelectItem value="mt5">MetaTrader 5</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountId">Account ID</Label>
                        <Input id="accountId" placeholder="Enter your account ID" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="Enter your account password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="server">Server</Label>
                        <Input id="server" placeholder="Enter your broker's server" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">
                        <Link className="h-4 w-4 mr-2" />
                        Connect Account
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Download className="h-5 w-5" />
                        Expert Advisor (EA)
                    </CardTitle>
                    <CardDescription>Download the EA and use the key below for setup.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="apiKey" className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4" /> Your Unique EA Key
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input id="apiKey" value={apiKey} readOnly className="font-code" />
                             <Button variant="ghost" size="icon" onClick={generateApiKey}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground p-4 bg-muted/50 rounded-lg space-y-2">
                        <p className="font-semibold">Installation Steps:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Download the EA file for your platform (MT4/MT5).</li>
                            <li>In MetaTrader, go to `File > Open Data Folder`.</li>
                            <li>Place the `.ex4` or `.ex5` file in the `MQL4/Experts` or `MQL5/Experts` folder.</li>
                            <li>Refresh your Expert Advisors list in the Navigator panel.</li>
                            <li>Drag the EA onto a chart and enter the unique key above when prompted.</li>
                        </ol>
                    </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download for MT4
                    </Button>
                     <Button variant="secondary" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download for MT5
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
