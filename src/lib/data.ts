

import type { Bot, NewsEvent, BotConfigurationData, AIReentry, MarketRegime, ExposureData, Notification } from './types';

// --- Mock Data (to be phased out or used for dev) ---
// This data is fetched from Firestore and this mock data is no longer used.
export const activeBotsData: Bot[] = [];
export const closedBotsData: Bot[] = [];

export const notificationData: Notification[] = [
  { id: '1', type: 'new_bot', title: 'New Bot Launched', description: 'Your new DCA Grid bot for EUR/USD is now active.', timestamp: '2 minutes ago', read: false },
  { id: '2', type: 'status_change', title: 'Bot Paused', description: 'The Trend Rider bot for GBP/USD has been manually paused.', timestamp: '15 minutes ago', read: false },
  { id: '3', type: 'bot_closed', title: 'Trade Closed', description: 'Your GBP/JPY bot hit Take Profit for +$512.60.', timestamp: '1 hour ago', read: true },
  { id: '4', type: 'status_change', title: 'Bot Error', description: 'XAU/USD bot has encountered a connection error.', timestamp: '3 hours ago', read: true },
];

export const botConfigurationData: BotConfigurationData = {
    botType: 'Dynamic DCA',
    lotSize: 0.01,
    maxPositions: 5,
    reentryDelay: 15,
    stopLoss: 500,
    takeProfit: 100,
    enableDSizeExit: true,
    dSizeExitThreshold: 6.0,
    enableTrailingStop: false,
    trailingStopPips: 20,
    newsFilter: true,
    weekendTrading: false,
    aiOptimization: true,
    gridLevels: 5,
    gridDistance: 20,
    lotSizeMultiplier: 1.5,
    takeProfitType: 'fixed',
    closeOnRetrace: false,
    retracePercentage: 50,
};

export const aiReentriesData: AIReentry[] = [
    { level: 1, priceOffset: 'R/S Level -20', lotSize: 0.02, condition: 'Support Retest' },
    { level: 2, priceOffset: 'R/S Level -40', lotSize: 0.03, condition: 'Fib 61.8%' },
    { level: 3, priceOffset: 'R/S Level -60', lotSize: 0.05, condition: 'Volume Spike' },
    { level: 4, priceOffset: 'R/S Level -80', lotSize: 0.07, condition: 'Oversold RSI' },
];


export const newsData: NewsEvent[] = [
  // Monday
  { id: '1', date: 'MONDAY, JUL 15', time: '8:30am', currency: 'CAD', impact: 'Medium', event: 'Manufacturing Sales (MoM)', actual: null, forecast: '1.1%', previous: '1.1%' },
  { id: '2', date: 'MONDAY, JUL 15', time: '8:30am', currency: 'USD', impact: 'Low', event: 'Empire State Manufacturing Index', actual: null, forecast: '-2.1', previous: '-6.0' },
  // Tuesday
  { id: '3', date: 'TUESDAY, JUL 16', time: '8:30am', currency: 'USD', impact: 'High', event: 'Core Retail Sales (MoM)', actual: null, forecast: '0.2%', previous: '0.2%' },
  { id: '4', date: 'TUESDAY, JUL 16', time: '8:30am', currency: 'USD', impact: 'High', event: 'Retail Sales (MoM)', actual: null, forecast: '0.3%', previous: '0.1%' },
  { id: '5', date: 'TUESDAY, JUL 16', time: '9:15am', currency: 'USD', impact: 'Medium', event: 'Industrial Production (MoM)', actual: null, forecast: '0.1%', previous: '0.9%' },
  { id: '6', date: 'TUESDAY, JUL 16', time: '4:00pm', currency: 'USD', impact: 'Low', event: 'TIC Long-Term Purchases', actual: null, forecast: null, previous: '$123.1B' },
  // Wednesday
  { id: '7', date: 'WEDNESDAY, JUL 17', time: '8:30am', currency: 'USD', impact: 'Medium', event: 'Building Permits', actual: null, forecast: '1.45M', previous: '1.39M' },
  { id: '8', date: 'WEDNESDAY, JUL 17', time: '10:30am', currency: 'USD', impact: 'Low', event: 'Crude Oil Inventories', actual: null, forecast: '-2.1M', previous: '-2.5M' },
  // Thursday
  { id: '9', date: 'THURSDAY, JUL 18', time: '8:30am', currency: 'USD', impact: 'High', event: 'Unemployment Claims', actual: null, forecast: '239K', previous: '242K' },
  { id: '10', date: 'THURSDAY, JUL 18', time: '8:30am', currency: 'USD', impact: 'Medium', event: 'Philly Fed Manufacturing Index', actual: null, forecast: '4.8', previous: '4.5' },
  // Friday
  { id: '11', date: 'FRIDAY, JUL 19', time: '10:00am', currency: 'USD', impact: 'Low', event: 'Existing Home Sales', actual: null, forecast: '4.12M', previous: '4.14M' },
  { id: '12', date: 'FRIDAY, JUL 19', time: '2:00pm', currency: 'USD', impact: 'High', event: 'FOMC Member Barkin Speaks', actual: null, forecast: null, previous: null },
];
