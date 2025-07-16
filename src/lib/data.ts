

import type { DScore, Bot, EquityData, RiskMetric, ApiKey, NewsEvent, BotConfigurationData, AIReentry, MarketRegime, ExposureData, ForexData, CurrencyStrength, StrengthData, DScoreWeights, FMPQuote } from './types';

// --- MOCK D-SCORE DATA ---
export const dScoreData: DScore[] = [
    { id: '1', pair: 'EUR/USD', price: 1.0712, change: 0.0012, changesPercentage: 0.11, dScore: 8.8, grade: 'A', trendAlignment: 1.8, adxStrength: 0.8, maConvergence: 1.4, srRetest: 1.2, priceStructure: 0.9, atrVolatility: 0.8, marketRegimeFit: 1.5, currencyStrength: 0.4, signal: 'Buy', positions: 1, trends: { d1: 'buy', w1: 'buy' } },
    { id: '2', pair: 'GBP/JPY', price: 200.54, change: -0.25, changesPercentage: -0.12, dScore: 9.2, grade: 'A', trendAlignment: 2.0, adxStrength: 0.9, maConvergence: 1.5, srRetest: 1.0, priceStructure: 1.0, atrVolatility: 0.9, marketRegimeFit: 1.6, currencyStrength: 0.3, signal: 'Buy', positions: 0, trends: { d1: 'buy', w1: 'buy' } },
    { id: '3', pair: 'AUD/USD', price: 0.6605, change: 0.0005, changesPercentage: 0.08, dScore: 7.5, grade: 'B', trendAlignment: 1.5, adxStrength: 0.6, maConvergence: 1.0, srRetest: 1.1, priceStructure: 0.8, atrVolatility: 0.7, marketRegimeFit: 1.2, currencyStrength: 0.6, signal: 'Buy', positions: 2, trends: { d1: 'buy', w1: 'buy' } },
    { id: '4', pair: 'USD/CAD', price: 1.3721, change: -0.0015, changesPercentage: -0.11, dScore: 4.2, grade: 'C', trendAlignment: 0.5, adxStrength: 0.3, maConvergence: 0.4, srRetest: 0.8, priceStructure: 0.5, atrVolatility: 0.6, marketRegimeFit: 0.8, currencyStrength: 0.3, signal: 'Block', positions: 0, trends: { d1: 'sell', w1: 'buy' } },
    { id: '5', pair: 'XAU/USD', price: 2345.67, change: 12.45, changesPercentage: 0.53, dScore: 8.1, grade: 'B', trendAlignment: 1.7, adxStrength: 0.7, maConvergence: 1.3, srRetest: 1.0, priceStructure: 0.9, atrVolatility: 0.8, marketRegimeFit: 1.3, currencyStrength: 0.4, signal: 'Buy', positions: 1, trends: { d1: 'buy', w1: 'buy' } },
    { id: '6', pair: 'EUR/GBP', price: 0.8448, change: -0.0002, changesPercentage: -0.02, dScore: 6.5, grade: 'C', trendAlignment: 1.0, adxStrength: 0.5, maConvergence: 0.8, srRetest: 0.9, priceStructure: 0.7, atrVolatility: 0.6, marketRegimeFit: 1.0, currencyStrength: 1.0, signal: 'Sell', positions: 0, trends: { d1: 'sell', w1: 'sell' } },
    { id: '7', pair: 'NZD/USD', price: 0.6123, change: 0.0008, changesPercentage: 0.13, dScore: 7.1, grade: 'B', trendAlignment: 1.4, adxStrength: 0.6, maConvergence: 1.0, srRetest: 1.0, priceStructure: 0.8, atrVolatility: 0.7, marketRegimeFit: 1.1, currencyStrength: 0.5, signal: 'Buy', positions: 0, trends: { d1: 'buy', w1: 'buy' } },
    { id: '8', pair: 'USD/CHF', price: 0.9150, change: -0.0010, changesPercentage: -0.11, dScore: 3.8, grade: 'C', trendAlignment: 0.4, adxStrength: 0.2, maConvergence: 0.3, srRetest: 0.7, priceStructure: 0.4, atrVolatility: 0.5, marketRegimeFit: 0.7, currencyStrength: 0.6, signal: 'Block', positions: 0, trends: { d1: 'sell', w1: 'buy' } },
    { id: '9', pair: 'AUD/JPY', price: 105.50, change: 0.15, changesPercentage: 0.14, dScore: 8.9, grade: 'A', trendAlignment: 1.9, adxStrength: 0.8, maConvergence: 1.5, srRetest: 1.1, priceStructure: 0.9, atrVolatility: 0.8, marketRegimeFit: 1.5, currencyStrength: 0.4, signal: 'Buy', positions: 0, trends: { d1: 'buy', w1: 'buy' } },
    { id: '10', pair: 'GBP/USD', price: 1.2680, change: 0.0020, changesPercentage: 0.16, dScore: 7.8, grade: 'B', trendAlignment: 1.6, adxStrength: 0.7, maConvergence: 1.2, srRetest: 1.1, priceStructure: 0.8, atrVolatility: 0.7, marketRegimeFit: 1.2, currencyStrength: 0.5, signal: 'Buy', positions: 1, trends: { d1: 'buy', w1: 'buy' } },
];

export const pairs = dScoreData.map(d => d.pair);
const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD', 'CHF'];

// Define the default and AI-recommended weights to be used in the calculation
export const defaultWeights: DScoreWeights = {
    trendAlignment: 2.0,
    adxStrength: 1.0,
    maConvergence: 1.5,
    srRetest: 1.5,
    priceStructure: 1.0,
    atrVolatility: 1.0,
    marketRegimeFit: 2.0,
    currencyStrength: 1.0,
};

export const aiRecommendedWeights: DScoreWeights = {
    trendAlignment: 2.5,
    adxStrength: 0.5,
    maConvergence: 1.5,
    srRetest: 1.0,
    priceStructure: 1.0,
    atrVolatility: 0.5,
    marketRegimeFit: 1.5,
    currencyStrength: 1.5,
};

export const activeBotsData: Bot[] = [
  { id: 'bot1', pair: 'EUR/USD', strategy: 'DCA Grid', status: 'active', profit_loss: 152.3, drawdown: 25.5, entry_time: '2024-05-20T10:30:00Z', d_score_entry: 8.2, stopLoss: 50, takeProfit: 100 },
  { id: 'bot2', pair: 'GBP/USD', strategy: 'Trend Rider', status: 'active', profit_loss: -45.1, drawdown: 78.2, entry_time: '2024-05-20T11:05:00Z', d_score_entry: 7.5, stopLoss: 50, takeProfit: 100 },
  { id: 'bot3', pair: 'AUD/USD', strategy: 'Breakout', status: 'active', profit_loss: 210.55, drawdown: 15.0, entry_time: '2024-05-20T14:00:00Z', d_score_entry: 9.1, stopLoss: 50, takeProfit: 100 },
  { id: 'bot4', pair: 'USD/JPY', strategy: 'DCA Grid', status: 'paused', profit_loss: 89.7, drawdown: 110.8, entry_time: '2024-05-19T22:15:00Z', d_score_entry: 6.8, stopLoss: 50, takeProfit: 100 },
  { id: 'bot5', pair: 'XAU/USD', strategy: 'DCA Grid', status: 'error', profit_loss: -112.0, drawdown: 150.0, entry_time: '2024-05-18T08:45:00Z', d_score_entry: 8.8, d_score_exit: 5.4, stopLoss: 50, takeProfit: 100 },
];

export const closedBotsData: Bot[] = [
    { id: 'bot6', pair: 'EUR/CAD', strategy: 'Trend Rider', status: 'closed', profit_loss: 345.12, drawdown: 0, entry_time: '2024-05-18T10:00:00Z', d_score_entry: 8.5, d_score_exit: 7.0 },
    { id: 'bot7', pair: 'NZD/USD', strategy: 'Breakout', status: 'closed', profit_loss: -88.40, drawdown: 0, entry_time: '2024-05-17T15:30:00Z', d_score_entry: 7.8, d_score_exit: 6.1 },
    { id: 'bot8', pair: 'GBP/JPY', strategy: 'DCA Grid', status: 'closed', profit_loss: 512.60, drawdown: 0, entry_time: '2024-05-19T09:00:00Z', d_score_entry: 9.2, d_score_exit: 7.5 },
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
    { id: 'fmp', name: 'Financial Modeling Prep', key: process.env.FMP_API_KEY || 'YOUR_FMP_API_KEY' },
    { id: 'cftc', name: 'CFTC API URL', key: 'https://www.cftc.gov/files/dea/newcot/' },
    { id: 'google', name: 'Google API Key', key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY' },
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


const generateMockStrengthData = (currency: string): StrengthData => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        data.push({
            date: date.toISOString().split('T')[0],
            strength: Math.floor(Math.random() * 8 + 1)
        });
    }
    return { currency, data };
};


export const strengthData: StrengthData[] = majorCurrencies.map(generateMockStrengthData);


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
