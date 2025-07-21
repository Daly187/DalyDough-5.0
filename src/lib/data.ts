

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
