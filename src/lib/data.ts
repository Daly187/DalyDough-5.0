

import type { DScore, Bot, EquityData, RiskMetric, ApiKey, NewsEvent, BotConfigurationData, AIReentry, MarketRegime, ExposureData, ForexData, FMPHistoricalPrice } from './types';

const getGrade = (score: number): 'A' | 'B' | 'C' => {
  if (score >= 8.5) return 'A';
  if (score >= 7.0) return 'B';
  return 'C';
};

export const pairs = ['AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD', 'CAD/JPY', 'CHF/JPY', 'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/NZD', 'EUR/TRY', 'EUR/USD', 'GBP/AUD', 'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD', 'NZD/CHF', 'NZD/JPY', 'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY', 'USD/TRY', 'USD/ZAR', 'XAU/USD'];

export let strengthData: any[] = []; // This is now unused, can be removed later.

// --- D-Score Calculation ---

const WEIGHTS = {
    trendAlignment: 3.0,
    adxStrength: 1.5,
    rsiMomentum: 1.0,
    macdMomentum: 1.0,
    atrVolatility: 1.0,
    bollingerBands: 0.5,
    stochasticOscillator: 0.5,
    parabolicSAR: 0.5,
    cci: 0.5,
    obv: 0.5, // Note: OBV is not typically available for Forex, so this will be 0.
};

// Helper to calculate score for each factor
const calculateTrendAlignment = (price: number, ema4h: number, emaD: number, emaW: number): number => {
    const isUp = price > ema4h && price > emaD && price > emaW;
    const isDown = price < ema4h && price < emaD && price < emaW;
    return (isUp || isDown) ? WEIGHTS.trendAlignment : 0;
};

const calculateAdxStrength = (adx: number): number => {
    return adx >= 20 ? WEIGHTS.adxStrength : 0;
};

const calculateRsiMomentum = (rsi: number): number => {
    return rsi > 30 && rsi < 70 ? WEIGHTS.rsiMomentum : 0;
};

const calculateMacdMomentum = (macd: number, histogram: number): number => {
    // Buy signal: MACD line is above signal line (macd > 0) and histogram is rising
    // Sell signal: MACD line is below signal line (macd < 0) and histogram is falling
    // For simplicity, we just check if histogram is non-zero, indicating momentum.
    // A more complex check could see if histogram has crossed zero recently.
    if ((macd > 0 && histogram > 0) || (macd < 0 && histogram < 0)) {
        return WEIGHTS.macdMomentum;
    }
    return 0;
};

const calculateAtrVolatility = (atr: number, historicalAtr: number[]): number => {
    if (historicalAtr.length === 0) return 0;
    const medianAtr = [...historicalAtr].sort((a,b) => a-b)[Math.floor(historicalAtr.length / 2)];
    return atr >= medianAtr ? WEIGHTS.atrVolatility : 0;
};

const calculateBollingerBands = (price: number, upperBand: number, lowerBand: number): number => {
    // Simple check: is price near the bands? (within 1% of the band range)
    const bandRange = upperBand - lowerBand;
    if (Math.abs(price - upperBand) < bandRange * 0.01 || Math.abs(price - lowerBand) < bandRange * 0.01) {
        return WEIGHTS.bollingerBands;
    }
    return 0;
};

const calculateStochastic = (k: number, d: number): number => {
    // Avoid overbought/sold, but require a cross for signal
    const isBullishCross = k > d && k < 80 && d < 80;
    const isBearishCross = k < d && k > 20 && d > 20;
    return (isBullishCross || isBearishCross) ? WEIGHTS.stochasticOscillator : 0;
};

const calculateParabolicSar = (price: number, sar: number, isBullish: boolean): number => {
    if (isBullish && price > sar) return WEIGHTS.parabolicSAR;
    if (!isBullish && price < sar) return WEIGHTS.parabolicSAR;
    return 0;
};

const calculateCci = (cci: number): number => {
    return Math.abs(cci) < 100 ? WEIGHTS.cci : 0; // Check if not in extreme territory
};

export const calculateDScore = async (data: ForexData): Promise<DScore> => {
  const quote = data.quote?.[0];
  const price = quote?.bid ?? 0;
  const change = quote?.changes ?? 0;

  const defaultScore: DScore = {
    id: data.pair, pair: data.pair, price: 0, change: 0, changesPercentage: 0, dScore: 0, grade: 'C',
    signal: 'Block', positions: 0,
    trendAlignment: 0, adxStrength: 0, rsiMomentum: 0, macdMomentum: 0,
    atrVolatility: 0, bollingerBands: 0, stochasticOscillator: 0, parabolicSAR: 0, cci: 0, obv: 0,
  };

  if (!price || !quote) {
    return defaultScore;
  }
  
  // Extract latest indicator values
  const ema50_4h = data.ema50_4h?.[0]?.ema ?? 0;
  const ema50d = data.ema50d?.[0]?.ema ?? 0;
  const ema50_w = data.ema50_w?.[0]?.ema ?? 0;
  const adx = data.adx?.[0]?.adx ?? 0;
  const rsi = data.rsi?.[0]?.rsi ?? 0;
  const macd = data.macd?.[0];
  const atr = data.atr?.[0]?.atr ?? 0;
  const historicalAtr = data.historical?.map(h => h.high - h.low) ?? [];
  const bb = data.bb?.[0];
  const stochastic = data.stochastic?.[0];
  const sar = data.sar?.[0]?.sar ?? 0;
  const cci = data.cci?.[0]?.cci ?? 0;
  
  // Calculate scores
  const trendAlignment = calculateTrendAlignment(price, ema50_4h, ema50d, ema50_w);
  const adxStrength = calculateAdxStrength(adx);
  const rsiMomentum = calculateRsiMomentum(rsi);
  const macdMomentum = calculateMacdMomentum(macd?.macd ?? 0, macd?.histogram ?? 0);
  const atrVolatility = calculateAtrVolatility(atr, historicalAtr);
  const bollingerBands = calculateBollingerBands(price, bb?.upperBand ?? 0, bb?.lowerBand ?? 0);
  const stochasticOscillator = calculateStochastic(stochastic?.k ?? 0, stochastic?.d ?? 0);
  const isBullishTrend = price > ema50d;
  const parabolicSAR = calculateParabolicSar(price, sar, isBullishTrend);
  const cciScore = calculateCci(cci);

  const totalScore = 
    trendAlignment + adxStrength + rsiMomentum + macdMomentum + atrVolatility +
    bollingerBands + stochasticOscillator + parabolicSAR + cciScore;
  
  let signal: 'Buy' | 'Sell' | 'Block' = 'Block';
  if (totalScore >= 7.0 && price > ema50d) signal = 'Buy';
  if (totalScore >= 7.0 && price < ema50d) signal = 'Sell';

  const changesPercentage = quote.open !== 0 ? (change / quote.open) * 100 : 0;

  return {
    ...defaultScore,
    price,
    change,
    changesPercentage,
    dScore: Math.min(totalScore, 10),
    grade: getGrade(totalScore),
    signal,
    trendAlignment,
    adxStrength,
    rsiMomentum,
    macdMomentum,
    atrVolatility,
    bollingerBands,
    stochasticOscillator,
    parabolicSAR,
    cci: cciScore,
    obv: 0, // Not available for Forex
  };
};

// --- Mock Data (to be phased out or used for dev) ---
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
