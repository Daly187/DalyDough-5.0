
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const learningContent = [
    {
        title: "Chapter 1: Introduction to Forex Trading",
        content: [
            {
                subTitle: "What is Forex?",
                text: "Forex, or the foreign exchange market, is a global decentralized or over-the-counter (OTC) market for the trading of currencies. This market determines foreign exchange rates for every currency. It includes all aspects of buying, selling and exchanging currencies at current or determined prices."
            },
            {
                subTitle: "Key Terminology",
                list: [
                    "Currency Pair: The two currencies in a foreign exchange transaction (e.g., EUR/USD).",
                    "Pip (Percentage in Point): The smallest price move that a given exchange rate can make.",
                    "Lot Size: The number of currency units you will buy or sell.",
                    "Leverage: The use of borrowed funds to increase one's trading position beyond what would be available from their cash balance alone.",
                    "Margin: The amount of money required in your account to open a leveraged position.",
                ]
            }
        ]
    },
    {
        title: "Chapter 2: Understanding Technical Indicators",
        content: [
            {
                subTitle: "What are Technical Indicators?",
                text: "Technical indicators are heuristic or pattern-based signals produced by the price, volume, and/or open interest of a security or contract. This app uses several key indicators to calculate the D-Score."
            },
            {
                subTitle: "Core Indicators Used in D-Score:",
                list: [
                    "Moving Averages (EMA): We use Exponential Moving Averages to determine trend direction. A price above the EMA suggests an uptrend; below suggests a downtrend.",
                    "ADX (Average Directional Index): Measures trend strength, not direction. A high ADX (above 25) indicates a strong trend, regardless of whether it's up or down.",
                    "RSI (Relative Strength Index): A momentum oscillator that measures the speed and change of price movements. It helps identify overbought (>70) or oversold (<30) conditions.",
                    "MACD (Moving Average Convergence Divergence): A trend-following momentum indicator that shows the relationship between two moving averages of a security’s price.",
                    "ATR (Average True Range): Measures market volatility by decomposing the entire range of an asset price for that period."
                ]
            }
        ]
    },
    {
        title: "Chapter 3: The D-Score System Explained",
        content: [
            {
                subTitle: "What is the D-Score?",
                text: "The D-Score is our proprietary algorithm designed to quantify the quality of a potential trade setup. It analyzes multiple technical indicators across different timeframes to produce a single, actionable score from 0 to 10."
            },
            {
                subTitle: "How is the D-Score Calculated?",
                text: "The score is a weighted sum of several factors. The most important factors are:",
                list: [
                    "Trend Alignment (Weight: 4.0): Are the short-term, medium-term, and long-term trends all pointing in the same direction? This is the most heavily weighted component.",
                    "Trend Strength (ADX, Weight: 2.5): How strong is the prevailing trend? A strong, clear trend gets a higher score.",
                    "Momentum (MACD, Weight: 1.0): Is there strong momentum behind the current price movement?",
                    "Volatility (ATR, Weight: 1.5): Assesses market volatility. The system prefers healthy, trending volatility over extreme or stagnant conditions.",
                    "Confirmation Indicators (Stochastic, SAR, CCI, Weight: 1.0): Other indicators provide additional confirmation and context, refining the final score."
                ]
            },
             {
                subTitle: "Interpreting the Score:",
                list: [
                    "8.5 - 10 (Grade A): Very high-probability setup. Strong alignment across all factors.",
                    "7.0 - 8.4 (Grade B): Good setup. Most factors are aligned, indicating a solid opportunity.",
                    "< 7.0 (Grade C): Lower probability. The tool will generally filter these out unless manually configured otherwise."
                ]
            }
        ]
    },
    {
        title: "Chapter 4: Understanding Bot Types",
        content: [
            {
                subTitle: "Dynamic DCA (Dollar-Cost Averaging)",
                text: "This is a sophisticated grid strategy. If the initial trade moves into a loss, the bot automatically opens new trades at predetermined intervals (Grid Distance) to get a better average entry price. It uses a Lot Size Multiplier to increase position size on subsequent entries and a Grid Distance Multiplier to widen the space between entries as the grid deepens. The 'Dynamic' aspect means it can use AI to adjust re-entry timing based on market conditions like volatility or D-Score changes. It's ideal for ranging or slowly trending markets."
            },
            {
                subTitle: "Trend Rider",
                text: "A classic trend-following strategy. This bot aims to enter a trade when the D-Score indicates a strong trend is underway and ride that trend for a significant profit. Unlike DCA, it typically does not open multiple positions against the trend; it's designed to capture a single, powerful market move."
            },
            {
                subTitle: "Mean Reversion",
                text: "This strategy operates on the belief that prices tend to return to their historical average. The bot looks for assets that are heavily 'overbought' (price is unusually high) or 'oversold' (price is unusually low) and places a trade in the opposite direction, betting on a correction."
            },
            {
                subTitle: "Buy and Hold / Sell and Hold",
                text: "These are the most basic strategies. The bot will execute a single buy or sell order and hold it until it's manually closed or hits a pre-defined Stop Loss or Take Profit. It does not use any grid or re-entry logic. This is useful for simple, one-off trades based on a strong D-Score signal."
            }
        ]
    },
    {
        title: "Chapter 5: Using the Auto Bot Launcher",
        content: [
            {
                subTitle: "Finding Opportunities",
                text: "The 'Auto Bot' page is your mission control. The 'Market Opportunities' table shows you the highest-scoring pairs based on your filter settings. Look for pairs with a high D-Score (ideally 7.0+) and a clear 'Buy' or 'Sell' signal."
            },
            {
                subTitle: "Bot Configuration",
                text: "Once you select a pair, the 'Bot Configuration' panel lets you define your trade parameters:",
                list: [
                    "Initial Lot Order: The size of your first trade. Start small if you're new.",
                    "Grid Levels & Distance: The bot uses a Dollar-Cost Averaging (DCA) grid. This means if the trade moves against you, it will open new trades at set distances (in pips) to average your entry price.",
                    "Lot Size Multiplier: Determines how much the lot size increases for each subsequent trade in the grid.",
                    "Take Profit & Stop Loss: Your exit plan. Take Profit is your target profit in dollars, while Stop Loss is your maximum acceptable loss.",
                    "D-Size Exit Threshold: A key safety feature. If the D-Score for the pair drops below this value, the bot will not open any new trades and will exit at the next take profit.",
                ]
            }
        ]
    },
    {
        title: "Chapter 6: Managing Active & Closed Bots",
        content: [
            {
                subTitle: "Monitoring Active Bots",
                text: "The 'Bots' page shows all your active and closed trades. For active bots, monitor the P/L (Profit/Loss) and Drawdown.",
                list: [
                    "P/L: Your current unrealized profit or loss.",
                    "Drawdown: The amount of money your account has lost from its peak. High drawdown is a sign of risk.",
                    "Current D-Score vs. Entry D-Score: This is critical. If the current D-Score has dropped significantly since you entered the trade, it may be a sign that market conditions have changed."
                ]
            },
            {
                subTitle: "Managing a Live Trade",
                text: "Clicking 'Manage' on an active bot allows you to intervene:",
                list: [
                    "Pause: Temporarily stops the bot from opening new trades.",
                    "Close at TP: The bot will not open new trades and will close the entire position once the take profit target is hit.",
                    "Close Now: Immediately closes all trades for that bot at the current market price, realizing any profit or loss.",
                    "Adjust SL/TP: You can modify your Stop Loss and Take Profit levels mid-trade."
                ]
            },
             {
                subTitle: "Reviewing Closed Bots",
                text: "Analyzing your closed trades is essential for learning. Review which setups were most profitable. Did high D-Score trades perform better? What was the drawdown like on your winning trades vs. your losing trades? Use this information to refine your bot configuration settings over time."
            }
        ]
    }
];

export default function LearningCenter() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {learningContent.map((chapter, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger className="text-lg font-headline hover:no-underline">{chapter.title}</AccordionTrigger>
          <AccordionContent className="prose prose-sm max-w-none text-muted-foreground space-y-4">
            {chapter.content.map((section, sIndex) => (
                <div key={sIndex}>
                    <h4 className="font-semibold text-foreground">{section.subTitle}</h4>
                    {section.text && <p>{section.text}</p>}
                    {section.list && (
                        <ul className="list-disc pl-5 space-y-2">
                            {section.list.map((item, iIndex) => (
                                <li key={iIndex}>{item}</li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
