
import type { DScore, Bot, EquityData, RiskMetric, ApiKey, NewsEvent, BotConfigurationData, AIReentry, MarketRegime, ExposureData, ForexData } from './types';

const getGrade = (score: number): 'A' | 'B' | 'C' => {
  if (score >= 8.5) return 'A';
  if (score >= 7.0) return 'B';
  return 'C';
};

export const pairs = ['AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD', 'CAD/JPY', 'CHF/JPY', 'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/NZD', 'EUR/TRY', 'EUR/USD', 'GBP/AUD', 'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD', 'NZD/CHF', 'NZD/JPY', 'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY', 'USD/TRY', 'USD/ZAR', 'XAU/USD'];

export const calculateDScore = (data: ForexData, index: number): DScore => {
  const quote = data.quote?.[0];
  const price = quote?.price ?? 0;
  const sma50 = data.sma50?.[0]?.sma;
  const sma100 = data.sma100?.[0]?.sma;
  const sma200 = data.sma200?.[0]?.sma;
  const adxData = data.adx?.[0];
  const adx = adxData?.adx ?? 0;
  const pdi = adxData?.pdi ?? 0;
  const mdi = adxData?.mdi ?? 0;
  const atr = data.atr?.[0]?.atr ?? 0;

  // --- START REVISED SCORING LOGIC ---
  
  // 1. Trend Alignment (Live)
  const trends = {
      d1: (price && sma50 && price > sma50) ? 'buy' : 'sell',
      w1: (price && sma200 && price > sma200) ? 'buy' : 'sell',
  };
  const trendValues = Object.values(trends);
  const buys = trendValues.filter(t => t === 'buy').length;
  const sells = trendValues.filter(t => t === 'sell').length;
  let trendAlignment = (buys === 2 || sells === 2) ? 2.0 : 0.5;

  // 2. ADX Strength (Live)
  const adxStrength = Math.min(adx / 50, 1.0);

  // 3. MA Convergence (Live)
  let maConvergence = 0;
  if (price && sma50 && sma100 && sma200) {
      const isUptrend = price > sma50 && sma50 > sma100 && sma100 > sma200;
      const isDowntrend = price < sma50 && sma50 < sma100 && sma100 < sma200;
      if (isUptrend || isDowntrend) maConvergence = 1.5;
      else {
          const uptrendPartial = (price > sma50 && sma50 > sma100) || (sma50 > sma100 && sma100 > sma200);
          const downtrendPartial = (price < sma50 && sma50 < sma100) || (sma50 < sma100 && sma100 < sma200);
          if (uptrendPartial || downtrendPartial) maConvergence = 0.75;
      }
  }

  // 4. ATR/Volatility (Live)
  const atrVolatility = price > 0 ? Math.min((atr / price) * 100, 1.0) : 0;

  // 5. S/R Retest (NEW LOGIC)
  let srRetest = 0;
  if (price && atr > 0) {
      const retestThreshold = atr * 0.5; // Price must be within 50% of ATR to be a retest
      if ((sma50 && Math.abs(price - sma50) < retestThreshold) ||
          (sma100 && Math.abs(price - sma100) < retestThreshold) ||
          (sma200 && Math.abs(price - sma200) < retestThreshold)) {
          srRetest = 1.5; // Full points if retesting a major MA
      }
  }

  // 6. Price Structure (NEW LOGIC)
  let priceStructure = 0;
  if (pdi > 0 && mdi > 0) {
      const totalDi = pdi + mdi;
      const diDiff = Math.abs(pdi - mdi);
      // Score based on how dominant one DI is over the other.
      // A large difference indicates a clearer trend structure.
      priceStructure = Math.min(diDiff / totalDi * 2.0, 1.0); // Max score of 1.0
  }

  // 7. Market Regime Fit (NEW LOGIC)
  let marketRegimeFit = 0;
  const isTrendingRegime = adx > 25;
  const isAlignedTrend = trendAlignment === 2.0;
  if (isTrendingRegime && isAlignedTrend) {
      marketRegimeFit = 2.0; // Perfect fit: high ADX and aligned trends
  } else if (isTrendingRegime && !isAlignedTrend) {
      marketRegimeFit = 0.5; // Bad fit: trending but MAs are not aligned
  } else if (!isTrendingRegime && !isAlignedTrend) {
      marketRegimeFit = 1.0; // Ok fit: not trending, and MAs are mixed (ranging market)
  }

  // --- END REVISED SCORING LOGIC ---

  const totalScore = trendAlignment + adxStrength + atrVolatility + srRetest + priceStructure + marketRegimeFit + maConvergence;
  
  let signal: 'Buy' | 'Sell' | 'Block' = 'Block';
  if (totalScore >= 7.0) {
    if (buys > sells) signal = 'Buy';
    if (sells > buys) signal = 'Sell';
  }

  const activePositions = activeBotsData.filter(bot => bot.pair === data.pair && bot.status === 'active').length;

  return {
    id: `${index + 1}`,
    pair: data.pair,
    price: price,
    change: quote?.change ?? 0,
    changesPercentage: quote?.changesPercentage ?? 0,
    dScore: totalScore,
    grade: getGrade(totalScore),
    trendAlignment,
    adxStrength,
    maConvergence,
    srRetest,
    priceStructure,
    atrVolatility,
    marketRegimeFit,
    signal,
    positions: activePositions,
    trends,
  };
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


const generateStrengthData = (currency: string) => {
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


export const strengthData: StrengthData[] = [
    generateStrengthData('EUR'),
    generateStrengthData('GBP'),
    generateStrengthData('JPY'),
    generateStrengthData('USD'),
    generateStrengthData('CAD'),
    generateStrengthData('AUD'),
    generateStrengthData('NZD'),
    generateStrengthData('CHF'),
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





    