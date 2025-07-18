import type { DScore, Bot, EquityData, RiskMetric, ApiKey, NewsEvent, BotConfigurationData, AIReentry, MarketRegime, ExposureData, ForexData, IndicatorSet } from './types';

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
    obv: 0.5,
};

// Helper functions to calculate score for each factor
const calculateTrendAlignment = (price: number, daily: IndicatorSet, fourHour: IndicatorSet, weekly: IndicatorSet): number => {
    if (!daily.ema50 || !fourHour.ema50 || !weekly.ema50) return 0;
    const isUp = price > fourHour.ema50 && price > daily.ema50 && price > weekly.ema50;
    const isDown = price < fourHour.ema50 && price < daily.ema50 && price < weekly.ema50;
    return (isUp || isDown) ? WEIGHTS.trendAlignment : 0;
};

const calculateAdxStrength = (daily: IndicatorSet): number => {
    return daily.adx && daily.adx >= 20 ? WEIGHTS.adxStrength : 0;
};

const calculateRsiMomentum = (daily: IndicatorSet): number => {
    return daily.rsi && daily.rsi > 30 && daily.rsi < 70 ? WEIGHTS.rsiMomentum : 0;
};

const calculateMacdMomentum = (daily: IndicatorSet): number => {
    if (!daily.macd) return 0;
    const { macd, histogram } = daily.macd;
    if ((macd > 0 && histogram > 0) || (macd < 0 && histogram < 0)) {
        return WEIGHTS.macdMomentum;
    }
    return 0;
};

const calculateAtrVolatility = (daily: IndicatorSet): number => {
    // This is a simplified check. A true median check would require more historical ATR values.
    // For now, we'll assume any positive ATR indicates sufficient volatility.
    return daily.atr && daily.atr > 0 ? WEIGHTS.atrVolatility : 0;
};

const calculateBollingerBands = (price: number, daily: IndicatorSet): number => {
    if (!daily.bb) return 0;
    const { upper, lower } = daily.bb;
    const bandRange = upper - lower;
    if (bandRange > 0 && (Math.abs(price - upper) < bandRange * 0.05 || Math.abs(price - lower) < bandRange * 0.05)) {
        return WEIGHTS.bollingerBands;
    }
    return 0;
};

const calculateStochastic = (daily: IndicatorSet): number => {
    if (!daily.stochastic) return 0;
    const { k, d } = daily.stochastic;
    const isBullishCross = k > d && k < 80 && d < 80;
    const isBearishCross = k < d && k > 20 && d > 20;
    return (isBullishCross || isBearishCross) ? WEIGHTS.stochasticOscillator : 0;
};

const calculateParabolicSar = (price: number, daily: IndicatorSet): number => {
    if (!daily.ema50 || !daily.sar) return 0;
    const isBullishTrend = price > daily.ema50;
    if (isBullishTrend && price > daily.sar) return WEIGHTS.parabolicSAR;
    if (!isBullishTrend && price < daily.sar) return WEIGHTS.parabolicSAR;
    return 0;
};

const calculateCci = (daily: IndicatorSet): number => {
    return daily.cci && Math.abs(daily.cci) < 100 ? WEIGHTS.cci : 0;
};

export const calculateDScore = async (data: ForexData): Promise<DScore> => {
  const quote = data.quote?.[0];
  const price = quote?.bid ?? 0;

  const defaultScore: DScore = {
    id: data.pair, pair: data.pair, price: 0, change: 0, changesPercentage: 0, dScore: 0, grade: 'C',
    signal: 'Block', positions: 0, lastUpdated: Date.now(),
    trendAlignment: 0, adxStrength: 0, rsiMomentum: 0, macdMomentum: 0,
    atrVolatility: 0, bollingerBands: 0, stochasticOscillator: 0, parabolicSAR: 0, cci: 0, obv: 0,
  };

  if (!price || !quote || !data.indicators) {
    return defaultScore;
  }
  
  const { daily, fourHour, weekly } = data.indicators;
  
  const trendAlignment = calculateTrendAlignment(price, daily, fourHour, weekly);
  const adxStrength = calculateAdxStrength(daily);
  const rsiMomentum = calculateRsiMomentum(daily);
  const macdMomentum = calculateMacdMomentum(daily);
  const atrVolatility = calculateAtrVolatility(daily);
  const bollingerBands = calculateBollingerBands(price, daily);
  const stochasticOscillator = calculateStochastic(daily);
  const parabolicSAR = calculateParabolicSar(price, daily);
  const cciScore = calculateCci(daily);

  const totalScore = 
    trendAlignment + adxStrength + rsiMomentum + macdMomentum + atrVolatility +
    bollingerBands + stochasticOscillator + parabolicSAR + cciScore;
  
  let signal: 'Buy' | 'Sell' | 'Block' = 'Block';
  if (totalScore >= 7.0 && daily.ema50 && price > daily.ema50) signal = 'Buy';
  if (totalScore >= 7.0 && daily.ema50 && price < daily.ema50) signal = 'Sell';

  const change = quote?.changes ?? 0;
  const changesPercentage = quote.open !== 0 ? (change / quote.open) * 100 : 0;

  return {
    ...defaultScore,
    price,
    change,
    changesPercentage,
    dScore: Math.min(totalScore, 10),
    grade: getGrade(totalScore),
    signal,
    lastUpdated: quote.timestamp,
    trendAlignment,
    adxStrength,
    rsiMomentum,
    macdMomentum,
    atrVolatility,
    bollingerBands,
    stochasticOscillator,
    parabolicSAR,
    cci: cciScore,
    obv: 0,
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
