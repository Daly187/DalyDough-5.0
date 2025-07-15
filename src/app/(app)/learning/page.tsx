
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const learningModules = [
  {
    value: "item-1",
    title: "Forex Fundamentals",
    content: [
      {
        title: "What is Forex?",
        description: "The foreign exchange market (Forex) is a global marketplace for exchanging national currencies. It's the largest and most liquid financial market in the world.",
      },
      {
        title: "Pips, Lots, and Leverage",
        description: "A 'pip' is the smallest price move that a given exchange rate can make. A 'lot' is a unit of currency to standardize trades. 'Leverage' allows you to control a large amount of currency with a small amount of capital.",
      },
      {
        title: "Major, Minor, and Exotic Pairs",
        description: "Major pairs involve the USD and are the most traded (e.g., EUR/USD). Minor pairs don't include the USD but feature other major currencies (e.g., EUR/GBP). Exotic pairs involve a major currency and one from an emerging economy (e.g., USD/TRY).",
      },
    ],
  },
  {
    value: "item-2",
    title: "Understanding the D-Score",
    content: [
      {
        title: "What is the D-Score?",
        description: "The D-Score is DalyDough's proprietary algorithm that analyzes multiple market factors to produce a single, actionable score for a currency pair. A higher score indicates a higher probability trade setup.",
      },
      {
        title: "Key Components",
        description: "The score is calculated from Trend Alignment, ADX Strength, Moving Average Convergence, Support/Resistance Retests, Price Structure, and Volatility. You can adjust the weight of each component in the Settings page.",
      },
      {
        title: "How to Use It",
        description: "Use the Market Overview table on the Dashboard to find pairs with high D-Scores (typically 7.0+). A 'Buy' or 'Sell' signal indicates that conditions are favorable for launching a bot in that direction.",
      },
    ],
  },
  {
    value: "item-3",
    title: "Mastering the Auto Bot",
    content: [
      {
        title: "Bot Configuration",
        description: "The Manual Bot Launcher on the Dashboard and the Auto Bot page allow you to configure every aspect of your trading bot, from lot size and grid levels to advanced settings like AI Optimization and News Filters.",
      },
      {
        title: "DCA Grid Strategy",
        description: "Dollar-Cost Averaging (DCA) is a strategy where the bot opens additional trades at set intervals (grid distance) if the price moves against the initial position. This averages your entry price and can lead to profit on smaller retracements.",
      },
      {
        title: "Risk Management",
        description: "Always use the Stop Loss feature to define your maximum acceptable loss for a bot. Features like 'D-Size Exit Threshold' and 'Close on Retrace' provide additional, intelligent ways to manage risk automatically.",
      },
    ],
  },
];

export default function LearningPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold font-headline">
            Learning Center
          </h1>
          <p className="text-muted-foreground">
            From Forex basics to mastering the DalyDough platform.
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        {learningModules.map((module) => (
          <AccordionItem key={module.value} value={module.value}>
            <AccordionTrigger className="text-xl font-headline hover:no-underline">
              {module.title}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {module.content.map((item) => (
                  <Card key={item.title}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}
