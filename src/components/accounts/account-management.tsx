
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, KeyRound, RefreshCw, CheckCircle2, ShieldCheck, List } from "lucide-react";

export default function AccountManagement() {
    const [apiKey, setApiKey] = React.useState('');
    const [isConnected, setIsConnected] = React.useState(true); // Mock status

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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-1">
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
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" className="w-full" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Download for MT4
                    </Button>
                     <Button asChild variant="secondary" className="w-full">
                        <a href="/downloads/DalyDoughConnector.mq5" download>
                            <Download className="h-4 w-4 mr-2" />
                            Download for MT5
                        </a>
                    </Button>
                </CardFooter>
            </Card>

             <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <ShieldCheck className="h-5 w-5" />
                        Connection Status
                    </CardTitle>
                    <CardDescription>Monitor the link between DalyDough and your MT5.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-center flex-col gap-2 p-4 bg-muted rounded-lg">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <p className="font-semibold text-lg text-foreground">Connected</p>
                        <p className="text-sm text-muted-foreground">Last heartbeat: just now</p>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-2">
                        <p className="font-semibold">Connection Steps:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Download the EA file for your platform (MT4/MT5).</li>
                            <li>In MetaTrader, place the `.mq5` file in the `MQL5/Experts` folder and compile it.</li>
                            <li>Drag the compiled EA onto any chart.</li>
                            <li>In the EA's "Inputs" tab, paste your unique EA key.</li>
                            <li>Ensure "Allow WebRequest" is enabled in the EA's "Common" tab.</li>
                            <li>The status above should turn to "Connected".</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <List className="h-5 w-5" />
                        Connected Accounts
                    </CardTitle>
                    <CardDescription>A list of your currently linked trading accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center text-center text-sm text-muted-foreground h-48 border-2 border-dashed rounded-lg">
                        <p>No accounts have been linked via the EA yet.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
