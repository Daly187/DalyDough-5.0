import type { DScore, Bot, EquityData, RiskMetric, ApiKey, BotScannerData, CotData, NewsEvent, BotConfigurationData, AIReentry, MarketRegime, ExposureData } from './types';

const getGrade = (score: number): 'A' | 'B' | 'C' => {
  if (score >= 8.0) return 'A';
  if (score >= 6.0) return 'B';
  return 'C';
};

const pairs = ['AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD', 'CAD/JPY', 'CHF/JPY', 'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/NZD', 'EUR/TRY', 'EUR/USD', 'GBP/AUD', 'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD', 'NZD/CHF', 'NZD/JPY', 'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY', 'USD/TRY', 'USD/ZAR', 'XAU/USD'];

const generateRandomDScore = (pair: string, index: number): DScore => {
  const cotBias = Math.random() * 1.5;
  const trendAlignment = Math.random() * 2.0;
  const adx = Math.random() * 100;
  const adxStrength = Math.min(adx / 50, 1.0); // Capped at 1.0 for scores > 50
  const atrVolatility = Math.random() * 1.0;
  const srRetest = Math.random() * 1.5;
  const priceStructure = Math.random() * 1.0;
  const marketRegimeFit = Math.random() * 2.0;

  const totalScore = cotBias + trendAlignment + adxStrength + atrVolatility + srRetest + priceStructure + marketRegimeFit;
  
  let signal: 'Buy' | 'Sell' | 'Block' = 'Block';
  if (totalScore >= 7.0) {
    signal = Math.random() > 0.5 ? 'Buy' : 'Sell';
  }

  return {
    id: `${index + 1}`,
    pair,
    dScore: totalScore,
    grade: getGrade(totalScore),
    cotBias,
    trendAlignment,
    adxStrength,
    srRetest,
    priceStructure,
    atrVolatility,
    marketRegimeFit,
    regimeMultiplier: Math.random() * 0.4 + 0.8,
    cot: Math.floor(Math.random() * 150 - 75),
    adx: Math.floor(adx),
    signal,
    positions: Math.floor(Math.random() * 6),
    trends: {
      h4: Math.random() > 0.5 ? 'buy' : 'sell',
      d1: Math.random() > 0.5 ? 'buy' : 'sell',
      w1: Math.random() > 0.5 ? 'buy' : 'sell',
    },
  };
};


export const dScoreData: DScore[] = pairs.map(generateRandomDScore);

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
    { id: 'fmp', name: 'Financial Modeling Prep', key: 'RUTyEslPzCs5tHMBZUUxCr2no36EV45Q' },
    { id: 'cftc', name: 'CFTC API URL', key: 'https://www.cftc.gov/files/dea/newcot/' },
    { id: 'google', name: 'Google API Key', key: 'AIzaSyDjnRhuk8OkL12nwepY_YgeoVRS6VFVGGc' },
    { id: 'supabase_prod_url', name: 'Supabase URL (Prod)', key: 'https://rptysuvzufliibffzqgk.supabase.co' },
    { id: 'supabase_prod_anon', name: 'Supabase Anon Key (Prod)', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
];

export const botScannerData: BotScannerData = {
    minDSize: 7.5,
    maxDSize: 10.0,
    stopScore: 6.0,
    stopLoss: 20,
    takeProfit: 40,
    maxBotsPerPair: 2,
    scanInterval: 5,
    autoLaunch: true,
    pairs,
};

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


const generateCotData = (currency: string) => {
    const data = [];
    let long = Math.random() * 100000 + 50000;
    let short = Math.random() * 100000 + 50000;
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        long += (Math.random() - 0.5) * 20000;
        short += (Math.random() - 0.5) * 20000;
        data.push({
            date: date.toISOString().split('T')[0],
            long: Math.max(0, Math.floor(long)),
            short: Math.max(0, Math.floor(short)),
        });
    }
    return { currency, data };
};


export const cotData: CotData[] = [
    generateCotData('EUR'),
    generateCotData('GBP'),
    generateCotData('JPY'),
    generateCotData('USD'),
    generateCotData('CAD'),
    generateCotData('AUD'),
    generateCotData('NZD'),
    generateCotData('CHF'),
];


export const newsData: NewsEvent[] = [
    { id: '1', time: '08:30', currency: 'USD', impact: 'High', event: 'Consumer Price Index (MoM)', actual: '0.4%', forecast: '0.3%', previous: '0.2%' },
    { id: '2', time: '10:00', currency: 'EUR', impact: 'Medium', event: 'German ZEW Economic Sentiment', actual: '47.1', forecast: '46.5', previous: '42.9' },
    { id: '3', time: '14:30', currency: 'CAD', impact: 'Low', event: 'Manufacturing Sales (MoM)', actual: '-0.2%', forecast: '0.1%', previous: '0.5%' },
    { id: '4', time: '18:00', currency: 'NZD', impact: 'High', event: 'RBNZ Interest Rate Decision', actual: null, forecast: '5.50%', previous: '5.50%' },
    { id: '5', time: '21:45', currency: 'CNY', impact: 'Medium', event: 'Caixin Services PMI', actual: null, forecast: '52.6', previous: '52.7' },
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
