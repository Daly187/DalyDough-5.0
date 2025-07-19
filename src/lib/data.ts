

import type { DScore, Bot, EquityData, RiskMetric, ApiKey, NewsEvent, BotConfigurationData, AIReentry, MarketRegime, ExposureData, TradeAccount, Notification } from './types';

export const pairs = ['EUR/USD', 'USD/JPY', 'GBP/USD', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'EUR/JPY', 'GBP/JPY', 'XAU/USD'];

// --- Live-ish Data ---
export const linkedAccountsData: TradeAccount[] = [
    { id: '50012345', nickname: 'Main Profit', broker: 'IC Markets', balance: 10250.75, equity: 10850.25, status: 'Connected', isPrimary: true },
    { id: '50067890', nickname: 'Test Account', broker: 'Pepperstone', balance: 1000.00, equity: 950.50, status: 'Connected', isPrimary: false, copySettings: { enabled: true, weight: 0.1 } },
    { id: '50011223', nickname: 'Small Hedging', broker: 'IC Markets', balance: 500.00, equity: 520.00, status: 'Connected', isPrimary: false, copySettings: { enabled: true, weight: 0.05 } },
    { id: '50044556', nickname: 'Disconnected Acct', broker: 'ThinkMarkets', balance: 2500.00, equity: 2500.00, status: 'Disconnected', isPrimary: false, copySettings: { enabled: false, weight: 0.25 } },
    { id: '50077889', nickname: 'Error Account', broker: 'IC Markets', balance: 0.00, equity: 0.00, status: 'Error', isPrimary: false, copySettings: { enabled: false, weight: 1.0 } },
];


// --- Mock Data (to be phased out or used for dev) ---
export const activeBotsData: Bot[] = [
  { id: 'bot1', uid: 'user1', pair: 'EUR/USD', strategy: 'DCA Grid', status: 'active', profit_loss: 152.3, d_score_entry: 8.2, stopLoss: 50, takeProfit: 100 },
  { id: 'bot2', uid: 'user1', pair: 'GBP/USD', strategy: 'Trend Rider', status: 'active', profit_loss: -45.1, d_score_entry: 7.5, stopLoss: 50, takeProfit: 100 },
  { id: 'bot3', uid: 'user1', pair: 'AUD/USD', strategy: 'Breakout', status: 'active', profit_loss: 210.55, d_score_entry: 9.1, stopLoss: 50, takeProfit: 100 },
  { id: 'bot4', uid: 'user1', pair: 'USD/JPY', strategy: 'DCA Grid', status: 'paused', profit_loss: 89.7, d_score_entry: 6.8, stopLoss: 50, takeProfit: 100 },
  { id: 'bot5', uid: 'user1', pair: 'XAU/USD', strategy: 'DCA Grid', status: 'error', profit_loss: -112.0, d_score_entry: 8.8, d_score_exit: 5.4, stopLoss: 50, takeProfit: 100 },
];

export const closedBotsData: Bot[] = [
    { id: 'bot6', uid: 'user1', pair: 'EUR/CAD', strategy: 'Trend Rider', status: 'closed', profit_loss: 345.12, d_score_entry: 8.5, d_score_exit: 7.0 },
    { id: 'bot7', uid: 'user1', pair: 'NZD/USD', strategy: 'Breakout', status: 'closed', profit_loss: -88.40, d_score_entry: 7.8, d_score_exit: 6.1 },
    { id: 'bot8', uid: 'user1', pair: 'GBP/JPY', strategy: 'DCA Grid', status: 'closed', profit_loss: 512.60, d_score_entry: 9.2, d_score_exit: 7.5 },
];

export const notificationData: Notification[] = [
  { id: '1', type: 'new_bot', title: 'New Bot Launched', description: 'Your new DCA Grid bot for EUR/USD is now active.', timestamp: '2 minutes ago', read: false },
  { id: '2', type: 'status_change', title: 'Bot Paused', description: 'The Trend Rider bot for GBP/USD has been manually paused.', timestamp: '15 minutes ago', read: false },
  { id: '3', type: 'bot_closed', title: 'Trade Closed', description: 'Your GBP/JPY bot hit Take Profit for +$512.60.', timestamp: '1 hour ago', read: true },
  { id: '4', type: 'status_change', title: 'Bot Error', description: 'XAU/USD bot has encountered a connection error.', timestamp: '3 hours ago', read: true },
];


export const equityData: EquityData[] = [
  { date: '2024-05-01', equity: 540000 },
  { date: '2024-05-02', equity: 540500 },
  { date: '2024-05-03', equity: 541200 },
  { date: '2024-05-04', equity: 540800 },
  { date: '2024-05-05', equity: 541500 },
  { date: '2024-05-06', equity: 542500 },
  { date: '2024-05-07', equity: 543000 },
  { date: '2024-05-08', equity: 543800 },
  { date: '2024-05-09', equity: 544500 },
  { date: '2024-05-10', equity: 544200 },
  { date: '2024-05-11', equity: 545000 },
  { date: '2024-05-12', equity: 545800 },
  { date: '2024-05-13', equity: 546500 },
  { date: '2024-05-14', equity: 547000 },
  { date: '2024-05-15', equity: 547800 },
  { date: '2024-05-16', equity: 548500 },
  { date: '2024-05-17', equity: 549000 },
  { date: '2024-05-18', equity: 548700 },
  { date: '2024-05-19', equity: 549500 },
  { date: '2024-05-20', equity: 543025 },
];

export const riskMetricsData: RiskMetric[] = [
    { label: 'Max Drawdown', value: '12.5%', description: 'Peak-to-trough decline' },
    { label: 'Win/Loss Ratio', value: '68%', description: 'Winning trades / Total trades' },
    { label: 'Avg. R:R', value: '1:2.3', description: 'Average risk to reward ratio' },
    { label: 'Margin Usage', value: '3.5%', description: 'Currently used margin' },
];

export const apiKeysData: ApiKey[] = [
    { id: 'fmp', name: 'Financial Modeling Prep', key: process.env.FMP_API_KEY || 'RUTyEslPzCs5tHMBZUUxCr2no36EV45Q' },
    { id: 'cftc', name: 'CFTC API URL', key: 'https://www.cftc.gov/files/dea/newcot/' },
    { id: 'google', name: 'Google API Key', key: 'AIzaSyDjnRhuk8OkL12nwepY_YgeoVRS6VFVGGc' },
    { id: 'supabase_prod_url', name: 'Supabase URL (Prod)', key: 'https://rptysuvzufliibffzqgk.supabase.co' },
    { id: 'supabase_prod_anon', name: 'Supabase Anon Key (Prod)', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
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



export const marketRegimeData: MarketRegime[] = pairs.map(pair => ({
    currencyPair: pair,
    price: Math.random() * 1.5 + 0.5,
    volatility: Math.random() * 2,
    adx: Math.random() * 60 + 10,
    atr: Math.random() * 0.01,
    bollingerWidth: Math.random() * 0.05,
    maSlopes: 'Up, Up, Down',
}));

export const exposureData: ExposureData[] = [
    { currency: 'EUR', exposure: 12500.50, type: 'long' },
    { currency: 'USD', exposure: -8500.00, type: 'short' },
    { currency: 'GBP', exposure: 7800.75, type: 'long' },
    { currency: 'JPY', exposure: -15000.00, type: 'short' },
    { currency: 'AUD', exposure: 4200.25, type: 'long' },
    { currency: 'CAD', exposure: -2300.00, type: 'short' },
    { currency: 'CHF', exposure: 1500.00, type: 'long' },
    { currency: 'NZD', exposure: -500.00, type: 'short' },
];
