
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MarketFilter() {
    const router = useRouter();

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center font-headline">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Market Filter
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="minDSize">Min D-Size</Label>
                        <Input id="minDSize" type="number" defaultValue={7.0} />
                    </div>
                    <div>
                        <Label htmlFor="maxDSize">Max D-Size</Label>
                        <Input id="maxDSize" type="number" defaultValue={10.0} />
                    </div>
                </div>
                <div>
                    <Label htmlFor="setupQuality">Setup Quality</Label>
                    <Select defaultValue="all">
                        <SelectTrigger id="setupQuality">
                            <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Grades</SelectItem>
                            <SelectItem value="a">Grade A</SelectItem>
                            <SelectItem value="b">Grade B</SelectItem>
                            <SelectItem value="c">Grade C</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="trendAlignment">Trend Alignment</Label>
                    <Select defaultValue="all">
                        <SelectTrigger id="trendAlignment">
                            <SelectValue placeholder="Select trend" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Trends</SelectItem>
                             <SelectItem value="strong_buy">Strong Buy</SelectItem>
                            <SelectItem value="buy">Buy</SelectItem>
                            <SelectItem value="sell">Sell</SelectItem>
                            <SelectItem value="strong_sell">Strong Sell</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="entryStatus">Entry Status</Label>
                    <Select defaultValue="all">
                        <SelectTrigger id="entryStatus">
                            <SelectValue placeholder="Select signal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Signals</SelectItem>
                            <SelectItem value="buy">Allow Buy</SelectItem>
                            <SelectItem value="sell">Allow Sell</SelectItem>
                            <SelectItem value="block">Block</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="searchPairs">Search Pairs</Label>
                    <Input id="searchPairs" placeholder="EUR/USD, GBP..." />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full">
                    <Search className="h-4 w-4 mr-2"/>
                    Apply Filters
                </Button>
            </CardFooter>
        </Card>
    );
}
