

import type { DScore, Bot, EquityData, RiskMetric, ApiKey, NewsEvent, BotConfigurationData, AIReentry, MarketRegime, ExposureData, ForexData, StrengthData, CurrencyStrength, DScoreWeights } from './types';

const getGrade = (score: number): 'A' | 'B' | 'C' => {
  if (score >= 8.5) return 'A';
  if (score >= 7.0) return 'B';
  return 'C';
};

export const pairs = ['AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD', 'CAD/JPY', 'CHF/JPY', 'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/NZD', 'EUR/TRY', 'EUR/USD', 'GBP/AUD', 'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD', 'NZD/CHF', 'NZD/JPY', 'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY', 'USD/TRY', 'USD/ZAR', 'XAU/USD'];

const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD', 'CHF'];

// --- LIVE CURRENCY STRENGTH CALCULATION ---
export const calculateLiveCurrencyStrength = (allForexData: ForexData[]): CurrencyStrength[] => {
    const strengthScores: Record<string, { wins: number; total: number }> = {};
    majorCurrencies.forEach(c => strengthScores[c] = { wins: 0, total: 0 });

    for (const data of allForexData) {
        if (!data.quote || data.quote.length === 0) continue;

        const base = data.pair.substring(0, 3);
        const quote = data.pair.substring(4, 7);

        if (majorCurrencies.includes(base) && majorCurrencies.includes(quote)) {
            const change = data.quote[0].change ?? 0;
            
            strengthScores[base].total++;
            strengthScores[quote].total++;

            if (change > 0) {
                // Base currency went up
                strengthScores[base].wins++;
            } else if (change < 0) {
                // Quote currency went up (base went down)
                strengthScores[quote].wins++;
            }
        }
    }

    return majorCurrencies.map(currency => {
        const { wins, total } = strengthScores[currency];
        // Score from 0 to 10, where 5 is neutral.
        const score = total > 0 ? (wins / total) * 10 : 5; 
        return { currency, strength: parseFloat(score.toFixed(1)) };
    });
};

// Define the default and AI-recommended weights to be used in the calculation
export const defaultWeights: DScoreWeights = {
    trendAlignment: 2.0,
    adxStrength: 1.0,
    maConvergence: 1.5,
    srRetest: 0.5,
    priceStructure: 1.0,
    atrVolatility: 0.5,
    marketRegimeFit: 2.0,
    currencyStrength: 1.5,
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

export const calculateDScore = (data: ForexData, index: number, liveStrengthData: CurrencyStrength[], customWeights: DScoreWeights | null): DScore | null => {
  const quote = data.quote?.[0];
  const sma50 = data.sma50?.[0]?.sma;
  const sma100 = data.sma100?.[0]?.sma;
  const sma200 = data.sma200?.[0]?.sma;
  const adxData = data.adx?.[0];
  const atrData = data.atr?.[0];
  
  if (!quote || !sma50 || !sma100 || !sma200 || !adxData || !atrData) {
    return null; // Return null if essential data is missing
  }

  const price = quote.price;
  const adx = adxData.adx;
  const pdi = adxData.pdi;
  const mdi = adxData.mdi;
  const atr = atrData.atr;
  const weights = customWeights || defaultWeights;

  // --- RAW COMPONENT SCORES (0-1) ---
  const trends = {
      d1: (price > sma50) ? 'buy' : 'sell',
      w1: (price > sma200) ? 'buy' : 'sell',
  };
  const trendValues = Object.values(trends);
  const buys = trendValues.filter(t => t === 'buy').length;
  const sells = trendValues.filter(t => t === 'sell').length;
  const trendDirection = buys > sells ? 'buy' : 'sell';

  // 1. Trend Alignment
  let rawTrendAlignment = (buys === 2 || sells === 2) ? 1.0 : (buys === 1 || sells === 1) ? 0.25 : 0;
  
  // 2. ADX Strength
  let rawAdxStrength = 0;
  if (adx > 25) rawAdxStrength = 1.0;
  else if (adx > 20) rawAdxStrength = 0.5;

  // 3. MA Convergence
  let rawMaConvergence = 0;
  const isUptrend = price > sma50 && sma50 > sma100 && sma100 > sma200;
  const isDowntrend = price < sma50 && sma50 < sma100 && sma100 < sma200;
  if ((isUptrend && trendDirection === 'buy') || (isDowntrend && trendDirection === 'sell')) {
      rawMaConvergence = 1.0;
  } else {
      const isPartialUp = price > sma50 && sma50 > sma100;
      const isPartialDown = price < sma50 && sma50 < sma100;
      if ((isPartialUp && trendDirection === 'buy') || (isPartialDown && trendDirection === 'sell')) {
          rawMaConvergence = 0.5;
      }
  }

  // 4. S/R Retest
  let rawSrRetest = 0;
  const retestThreshold = atr * 0.5;
  const mas = [sma50, sma100, sma200];
  for (const ma of mas) {
      if (Math.abs(price - ma) < retestThreshold) {
          rawSrRetest = 1.0;
          break;
      }
  }

  // 5. Price Structure
  let rawPriceStructure = 0;
  const diDiff = Math.abs(pdi - mdi);
  if ((trendDirection === 'buy' && pdi > mdi && diDiff > 5) || (trendDirection === 'sell' && mdi > pdi && diDiff > 5)) {
    rawPriceStructure = Math.min(diDiff / 25, 1.0); // Normalize based on a typical strong diff
  }
  
  // 6. ATR/Volatility
  let rawAtrVolatility = 0;
  const volatilityPercentage = (atr / price); // e.g., 0.005 for 0.5%
  // Target moderate volatility (0.3% - 0.8%) as ideal
  if (volatilityPercentage >= 0.003 && volatilityPercentage <= 0.008) {
    rawAtrVolatility = 1.0;
  } else if (volatilityPercentage > 0.008) { // High volatility
    rawAtrVolatility = 0.5;
  } else { // Low volatility
    rawAtrVolatility = 0.25;
  }

  // 7. Market Regime Fit
  let rawMarketRegimeFit = 0;
  if (adx > 25) { // Trending regime
      if (rawTrendAlignment === 1.0 && rawMaConvergence === 1.0) {
          rawMarketRegimeFit = 1.0; // Perfect fit
      } else {
          rawMarketRegimeFit = 0.5; // Okay fit
      }
  } else { // Ranging/Dead regime
      rawMarketRegimeFit = 0.0; // Poor fit
  }

  // 8. Currency Strength
  const baseCurrency = data.pair.substring(0, 3);
  const quoteCurrency = data.pair.substring(4, 7);
  const baseStrengthData = liveStrengthData.find(s => s.currency === baseCurrency);
  const quoteStrengthData = liveStrengthData.find(s => s.currency === quoteCurrency);
  let rawCurrencyStrength = 0;
  if (baseStrengthData && quoteStrengthData) {
    const strengthDiff = baseStrengthData.strength - quoteStrengthData.strength; // positive if base is stronger
    if ((trendDirection === 'buy' && strengthDiff > 2) || (trendDirection === 'sell' && strengthDiff < -2)) {
        rawCurrencyStrength = Math.min(Math.abs(strengthDiff) / 5.0, 1.0); // Normalize against a significant diff of 5
    }
  }

  // --- WEIGHTED SCORES ---
  const trendAlignment = rawTrendAlignment * weights.trendAlignment;
  const adxStrength = rawAdxStrength * weights.adxStrength;
  const maConvergence = rawMaConvergence * weights.maConvergence;
  const srRetest = rawSrRetest * weights.srRetest;
  const priceStructure = rawPriceStructure * weights.priceStructure;
  const atrVolatility = rawAtrVolatility * weights.atrVolatility;
  const marketRegimeFit = rawMarketRegimeFit * weights.marketRegimeFit;
  const currencyStrength = rawCurrencyStrength * weights.currencyStrength;

  const totalScore = trendAlignment + adxStrength + maConvergence + srRetest + priceStructure + atrVolatility + marketRegimeFit + currencyStrength;
  
  let signal: 'Buy' | 'Sell' | 'Block' = 'Block';
  if (totalScore >= 7.0) {
    signal = trendDirection === 'buy' ? 'Buy' : 'Sell';
  }

  const activePositions = activeBotsData.filter(bot => bot.pair === data.pair && bot.status === 'active').length;

  return {
    id: `${index + 1}`,
    pair: data.pair,
    price: price,
    change: quote.change,
    changesPercentage: quote.changesPercentage,
    dScore: totalScore,
    grade: getGrade(totalScore),
    trendAlignment,
    adxStrength,
    maConvergence,
    srRetest,
    priceStructure: priceStructure,
    atrVolatility,
    marketRegimeFit,
    currencyStrength,
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
