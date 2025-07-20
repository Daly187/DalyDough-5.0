
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link as LinkIcon, Download, KeyRound, RefreshCw, Server, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase/firestore";
import { auth } from "@/lib/firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import type { TradeAccount } from "@/lib/types";
import { Separator } from "../ui/separator";

const accountSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  platform: z.enum(["mt4", "mt5"], { required_error: "Platform is required" }),
  accountId: z.string().min(1, "Account ID is required"),
  password: z.string().min(1, "Password is required"),
  server: z.string().min(1, "Server is required"),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface LinkAccountFormProps {
    onAccountAdded: (account: TradeAccount) => void;
}

export default function LinkAccountForm({ onAccountAdded }: LinkAccountFormProps) {
    const [apiKey, setApiKey] = React.useState('');
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const { register, handleSubmit, control, formState: { errors }, reset } = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
    });

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

    const onSubmit = async (data: AccountFormData) => {
        if (!user) {
            toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to link an account." });
            return;
        }

        setIsSubmitting(true);
        try {
            const newAccountData = {
                uid: user.uid,
                ...data,
                eaKey: apiKey, // Save the generated key
                balance: 0,
                equity: 0,
                status: 'Connecting', // Initial status
                isPrimary: false, // New accounts are not primary by default
                copySettings: { enabled: false, weight: 1.0 },
                createdAt: serverTimestamp(),
            };
            const docRef = await addDoc(collection(db, "tradeAccounts"), newAccountData);
            
            toast({ title: "Account Linking...", description: "Connecting to your trading account." });
            
            // Re-generate a new key for the next form entry and reset fields
            generateApiKey(); 
            reset();

            // Simulate connection process
            setTimeout(() => {
                 toast({ title: "Account Linked!", description: `Account ${data.nickname} has been successfully linked.` });
                 onAccountAdded({ id: docRef.id, ...newAccountData } as unknown as TradeAccount);
            }, 2000);

        } catch (error) {
            toast({ variant: "destructive", title: "Linking Failed", description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Server className="h-5 w-5" />
                        Link New Trading Account
                    </CardTitle>
                    <CardDescription>
                        Complete the form below, then download the Expert Advisor (EA) and install it in MetaTrader using the provided key.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nickname">Account Nickname</Label>
                            <Input id="nickname" placeholder="e.g., Main Profit Account" {...register("nickname")} />
                            {errors.nickname && <p className="text-red-500 text-xs">{errors.nickname.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="platform">Platform</Label>
                            <Controller
                                name="platform"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger id="platform">
                                            <SelectValue placeholder="Select Platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mt4">MetaTrader 4</SelectItem>
                                            <SelectItem value="mt5">MetaTrader 5</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.platform && <p className="text-red-500 text-xs">{errors.platform.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountId">Account ID</Label>
                            <Input id="accountId" placeholder="Enter your account ID" {...register("accountId")} />
                            {errors.accountId && <p className="text-red-500 text-xs">{errors.accountId.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="Enter your account password" {...register("password")} />
                            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="server">Server</Label>
                            <Input id="server" placeholder="Enter your broker's server" {...register("server")} />
                            {errors.server && <p className="text-red-500 text-xs">{errors.server.message}</p>}
                        </div>
                    </div>

                    <Separator />

                    {/* EA Section */}
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="apiKey" className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4" /> Your Unique EA Key for this Account
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input id="apiKey" value={apiKey} readOnly className="font-code" />
                                <Button variant="ghost" size="icon" type="button" onClick={generateApiKey}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">A new key is generated for each account you link. Use this key during EA setup in MetaTrader.</p>
                        </div>
                        <div className="text-xs text-muted-foreground p-4 bg-muted/50 rounded-lg space-y-2">
                            <p className="font-semibold text-foreground">Installation Steps:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Download the EA file for your platform below.</li>
                                <li>In MetaTrader, go to `File {' > '} Open Data Folder`.</li>
                                <li>Place the `.ex4` or `.ex5` file in the `MQL4/Experts` or `MQL5/Experts` folder.</li>
                                <li>Refresh your Expert Advisors list in the Navigator panel.</li>
                                <li>Drag the EA onto a chart and enter the unique key above when prompted.</li>
                            </ol>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/dalydough-ea.ex4" download className="w-full">
                                <Button variant="secondary" className="w-full" type="button">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download for MT4
                                </Button>
                            </Link>
                            <Link href="/dalydough-ea.ex5" download className="w-full">
                                <Button variant="secondary" className="w-full" type="button">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download for MT5
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                         {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                        {isSubmitting ? "Connecting..." : "Connect Account"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
