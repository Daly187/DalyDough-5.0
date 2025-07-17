
import type { DScore, Bot, EquityData, RiskMetric, ApiKey, NewsEvent, BotConfigurationData, AIReentry, MarketRegime, ExposureData, ForexData, StrengthData } from './types';

const getGrade = (score: number): 'A' | 'B' | 'C' => {
  if (score >= 8.5) return 'A';
  if (score >= 7.0) return 'B';
  return 'C';
};

export const pairs = ['AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD', 'CAD/JPY', 'CHF/JPY', 'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/NZD', 'EUR/TRY', 'EUR/USD', 'GBP/AUD', 'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD', 'NZD/CHF', 'NZD/JPY', 'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY', 'USD/TRY', 'USD/ZAR', 'XAU/USD'];

// This strengthData is now used as a fallback and for CSI calculation structure
export let strengthData: StrengthData[] = [
    { currency: 'EUR', data: [] },
    { currency: 'GBP', data: [] },
    { currency: 'JPY', data: [] },
    { currency: 'USD', data: [] },
    { currency: 'CAD', data: [] },
    { currency: 'AUD', data: [] },
    { currency: 'NZD', data: [] },
    { currency: 'CHF', data: [] },
];

// Update strength data based on live price changes
const updateStrengthData = (allForexData: ForexData[]) => {
    const changes: Record<string, number[]> = {
        'EUR': [], 'GBP': [], 'JPY': [], 'USD': [], 'CAD': [], 'AUD': [], 'NZD': [], 'CHF': []
    };

    allForexData.forEach(d => {
        if (d.pair.length === 7 && d.quote?.[0]?.changesPercentage) {
            const base = d.pair.substring(0, 3);
            const quote = d.pair.substring(4, 7);
            const change = d.quote[0].changesPercentage;

            if (changes[base]) changes[base].push(change);
            if (changes[quote]) changes[quote].push(-change);
        }
    });

    strengthData = strengthData.map(s => {
        const avgChange = changes[s.currency].length > 0
            ? changes[s.currency].reduce((a, b) => a + b, 0) / changes[s.currency].length
            : 0;
        
        // This is a simplified CSI logic. A more robust one would use rolling averages.
        // For now, we simulate a "strength" value based on average daily change.
        // A simple mapping: 1% change = 1 point of strength. Scale as needed.
        const strengthValue = 5 + (avgChange * 2); // Base of 5, +/- based on avg change
        
        return {
            ...s,
            data: [{ date: new Date().toISOString().split('T')[0], strength: Math.max(0, Math.min(10, strengthValue)) }]
        };
    });
};


const getCurrencyStrength = (currency: string): number => {
    const data = strengthData.find(s => s.currency === currency);
    // Use the most recent strength data, default to neutral 5
    return data?.data[data.data.length - 1]?.strength ?? 5; 
}

export const calculateDScore = async (data: ForexData, index: number, allForexData: ForexData[]): Promise<DScore> => {
  // Update strength data once per calculation batch
  if (index === 0) {
    updateStrengthData(allForexData);
  }

  const quote = data.quote?.[0];
  const price = quote?.price;

  if (!price) {
    // Cannot calculate score without a price, return a default object
    return {
        id: `${index + 1}`, pair: data.pair, price: 0, change: 0, changesPercentage: 0, dScore: 0, grade: 'C',
        adxStrength: 0, atrVolatility: 0, trendAlignment: 0, srRetest: 0, priceStructure: 0,
        marketRegimeFit: 0, currencyStrengthIndex: 0, signal: 'Block', positions: 0,
        trends: { d1: 'neutral', w1: 'neutral' },
    };
  }

  // 1. ADX Strength - Max 2.0
  const adx = data.adx?.[0]?.adx ?? 0;
  let adxStrength = 0;
  if (adx > 25) adxStrength = 2.0;
  else if (adx > 20) adxStrength = 1.0;

  // 2. ATR/Volatility - Max 1.5
  const atr = data.atr?.[0]?.atr ?? 0;
  const atrPercentage = (atr / price);
  const isNormalVolatility = atrPercentage > 0.003 && atrPercentage < 0.02;
  const atrVolatility = isNormalVolatility ? 1.5 : 0;

  // 3. Trend Alignment (1d/1w) - Max 2.0
  const dailySMA50 = data.sma50?.[0]?.sma;
  const weeklySMA50 = data.sma50_weekly?.[0]?.sma;
  let trendAlignment = 0;
  if (dailySMA50 && weeklySMA50) {
      const dailyTrend: 'buy' | 'sell' = price > dailySMA50 ? 'buy' : 'sell';
      const weeklyTrend: 'buy' | 'sell' = price > weeklySMA50 ? 'buy' : 'sell';
      if (dailyTrend === weeklyTrend) {
          trendAlignment = 2.0;
      } else {
          const dailyDiff = Math.abs(price - dailySMA50) / price;
          const weeklyDiff = Math.abs(price - weeklySMA50) / price;
          if (dailyDiff < 0.002 || weeklyDiff < 0.002) {
              trendAlignment = 1.0;
          }
      }
  }
  
  // 4. S/R Retest (Live) - Max 1.5
  let srRetest = 0;
  const sma50 = data.sma50?.[0]?.sma;
  const sma100 = data.sma100?.[0]?.sma;
  const sma200 = data.sma200?.[0]?.sma;
  if (sma50 && sma100 && sma200) {
    const smas = [sma50, sma100, sma200];
    for (const sma of smas) {
        if (Math.abs(price - sma) / price < 0.005) { // within 0.5% of a major SMA
            srRetest = 1.5;
            break;
        }
    }
  }

  // 5. Price Structure (Live) - Max 1.5
  let priceStructure = 0;
  if (sma50 && sma200) {
      const isBullish = price > sma50 && sma50 > sma200;
      const isBearish = price < sma50 && sma50 < sma200;
      if (isBullish || isBearish) {
          priceStructure = 1.5;
      }
  }

  // 6. Market Regime Fit (Live) - Max 2.0
  const marketRegimeFit = (adx > 25) ? 1.5 : (adx > 20 ? 0.75 : 0);


  // 7. Currency Strength Index (Live) - Max 1.0
  const baseCurrency = data.pair.substring(0, 3);
  const quoteCurrency = data.pair.substring(4, 7);
  const baseStrength = getCurrencyStrength(baseCurrency);
  const quoteStrength = getCurrencyStrength(quoteCurrency);
  let currencyStrengthIndex = 0;
  if ((baseStrength > 6 && quoteStrength < 4) || (baseStrength < 4 && quoteStrength > 6)) {
      currencyStrengthIndex = 1.0;
  } else if ((baseStrength > 5.5 && quoteStrength < 4.5) || (baseStrength < 4.5 && quoteStrength > 5.5)) {
      currencyStrengthIndex = 0.5;
  }

  const totalScore = 
    adxStrength + 
    atrVolatility + 
    trendAlignment +
    srRetest + 
    priceStructure + 
    marketRegimeFit + 
    currencyStrengthIndex;
  
  let signal: 'Buy' | 'Sell' | 'Block' = 'Block';
  if (totalScore >= 7.0 && dailySMA50) {
    if (price > dailySMA50) signal = 'Buy';
    else signal = 'Sell';
  }

  return {
    id: `${index + 1}`,
    pair: data.pair,
    price: price,
    change: quote?.change ?? 0,
    changesPercentage: quote?.changesPercentage ?? 0,
    dScore: Math.min(totalScore, 10),
    grade: getGrade(totalScore),
    adxStrength,
    atrVolatility,
    trendAlignment,
    srRetest,
    priceStructure,
    marketRegimeFit,
    currencyStrengthIndex,
    signal,
    positions: Math.floor(Math.random() * 6),
    trends: {
      d1: price > (dailySMA50 ?? price) ? 'buy' : 'sell',
      w1: price > (weeklySMA50 ?? price) ? 'buy' : 'sell'
    },
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

    
