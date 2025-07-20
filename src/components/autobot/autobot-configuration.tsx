

"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Save, Settings } from "lucide-react";

export default function AutoBotConfiguration() {
    const [entryThreshold, setEntryThreshold] = React.useState([7.0]);
    const [exitThreshold, setExitThreshold] = React.useState([6.0]);
  
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Settings className="h-5 w-5" />
                    Strategy Settings
                </CardTitle>
                <CardDescription>
                    Define the D-Score thresholds for automatically starting and stopping trades.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-3">
                    <Label htmlFor="entryThreshold" className="text-base">
                        Entry D-Score Threshold: <span className="font-bold text-primary">{`|${entryThreshold[0].toFixed(1)}|`}</span>
                    </Label>
                    <Slider
                        id="entryThreshold"
                        min={0}
                        max={10}
                        step={0.1}
                        value={entryThreshold}
                        onValueChange={setEntryThreshold}
                        className="[&>span>span]:bg-green-400"
                    />
                    <p className="text-sm text-muted-foreground">
                        A new bot will be launched for any included pair with an absolute D-Score greater than this value.
                    </p>
                </div>
                <div className="space-y-3">
                    <Label htmlFor="exitThreshold" className="text-base">
                        Exit D-Score Threshold: <span className="font-bold text-primary">{`|${exitThreshold[0].toFixed(1)}|`}</span>
                    </Label>
                    <Slider
                        id="exitThreshold"
                        min={0}
                        max={10}
                        step={0.1}
                        value={exitThreshold}
                        onValueChange={setExitThreshold}
                        className="[&>span>span]:bg-red-400"
                    />
                     <p className="text-sm text-muted-foreground">
                       If an active bot's absolute D-Score falls below this value, it will be set to 'Close at Next TP' and will not re-enter.
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save Strategy
                </Button>
            </CardFooter>
        </Card>
    );
}
