import type { DScore, Bot, EquityData, RiskMetric, ApiKey, BotScannerData, CotData, NewsEvent } from './types';

const getGrade = (score: number): 'A' | 'B' | 'C' => {
  if (score >= 8.0) return 'A';
  if (score >= 6.0) return 'B';
  return 'C';
};

const dScoresRaw = [
  { pair: 'EUR/USD', dScore: 8.2, cotBias: 1.5, trendConfirmation: 2.5, adxStrength: 0.8, srRetest: 1.5, priceStructure: 0.9, spreadCheck: 1.0, cot: 68, adx: 32, spread: 0.5, signal: 'Buy' as const },
  { pair: 'GBP/USD', dScore: 7.5, cotBias: 1.2, trendConfirmation: 2.8, adxStrength: 0.7, srRetest: 1.2, priceStructure: 0.8, spreadCheck: 0.8, cot: 55, adx: 28, spread: 0.8, signal: 'Buy' as const },
  { pair: 'USD/JPY', dScore: 5.8, cotBias: 0.8, trendConfirmation: 1.5, adxStrength: 0.5, srRetest: 1.0, priceStructure: 1.0, spreadCheck: 1.0, cot: -45, adx: 18, spread: 0.7, signal: 'Block' as const },
  { pair: 'AUD/USD', dScore: 9.1, cotBias: 1.8, trendConfirmation: 3.0, adxStrength: 0.9, srRetest: 1.8, priceStructure: 0.8, spreadCheck: 0.8, cot: 75, adx: 45, spread: 0.6, signal: 'Buy' as const },
  { pair: 'USD/CAD', dScore: 4.4, cotBias: 0.5, trendConfirmation: 1.0, adxStrength: 0.4, srRetest: 1.0, priceStructure: 0.5, spreadCheck: 1.0, cot: -60, adx: 15, spread: 0.9, signal: 'Block' as const },
  { pair: 'USD/CHF', dScore: 6.9, cotBias: 1.0, trendConfirmation: 2.2, adxStrength: 0.8, srRetest: 1.1, priceStructure: 0.8, spreadCheck: 1.0, cot: -70, adx: 25, spread: 1.1, signal: 'Sell' as const },
  { pair: 'XAU/USD', dScore: 8.8, cotBias: 1.7, trendConfirmation: 2.9, adxStrength: 0.9, srRetest: 1.5, priceStructure: 0.9, spreadCheck: 0.9, cot: 85, adx: 38, spread: 2.0, signal: 'Buy' as const },
];

export const dScoreData: DScore[] = dScoresRaw.map((item, index) => ({
  id: `${index + 1}`,
  ...item,
  grade: getGrade(item.dScore),
}));


export const activeBotsData: Bot[] = [
  { id: 'bot1', pair: 'EUR/USD', strategy: 'DCA Grid', status: 'active', profit_loss: 152.3, entry_time: '2024-05-20T10:30:00Z', d_score_entry: 8.2 },
  { id: 'bot2', pair: 'GBP/USD', strategy: 'Trend Rider', status: 'active', profit_loss: -45.1, entry_time: '2024-05-20T11:05:00Z', d_score_entry: 7.5 },
  { id: 'bot3', pair: 'USD/JPY', strategy: 'Mean Reversion', status: 'paused', profit_loss: 89.7, entry_time: '2024-05-19T22:15:00Z', d_score_entry: 6.8 },
  { id: 'bot4', pair: 'AUD/USD', strategy: 'Breakout', status: 'active', profit_loss: 210.55, entry_time: '2024-05-20T14:00:00Z', d_score_entry: 9.1 },
  { id: 'bot5', pair: 'XAU/USD', strategy: 'DCA Grid', status: 'error', profit_loss: -112.0, entry_time: '2024-05-18T08:45:00Z', d_score_entry: 8.8 },
];

export const equityData: EquityData[] = [
  { date: '2024-05-01', equity: 10000 },
  { date: '2024-05-02', equity: 10050 },
  { date: '2024-05-03', equity: 10120 },
  { date: '2024-05-04', equity: 10080 },
  { date: '2024-05-05', equity: 10150 },
  { date: '2024-05-06', equity: 10250 },
  { date: '2024-05-07', equity: 10300 },
  { date: '2024-05-08', equity: 10380 },
  { date: '2024-05-09', equity: 10450 },
  { date: '2024-05-10', equity: 10420 },
  { date: '2024-05-11', equity: 10500 },
  { date: '2024-05-12', equity: 10580 },
  { date: '2024-05-13', equity: 10650 },
  { date: '2024-05-14', equity: 10700 },
  { date: '2024-05-15', equity: 10780 },
  { date: '2024-05-16', equity: 10850 },
  { date: '2024-05-17', equity: 10900 },
  { date: '2024-05-18', equity: 10870 },
  { date: '2024-05-19', equity: 10950 },
  { date: '2024-05-20', equity: 11050 },
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
    pairs: ['EUR/USD', 'GBP/USD', 'AUD/USD', 'XAU/USD'],
};

export const cotData: CotData[] = [
    {
        currency: 'EUR',
        data: [
            { date: '2024-04-09', long: 120000, short: 80000 },
            { date: '2024-04-16', long: 125000, short: 75000 },
            { date: '2024-04-23', long: 130000, short: 70000 },
            { date: '2024-04-30', long: 140000, short: 60000 },
            { date: '2024-05-07', long: 135000, short: 65000 },
            { date: '2024-05-14', long: 150000, short: 50000 },
        ]
    },
    {
        currency: 'GBP',
        data: [
            { date: '2024-04-09', long: 60000, short: 40000 },
            { date: '2024-04-16', long: 62000, short: 38000 },
            { date: '2024-04-23', long: 65000, short: 35000 },
            { date: '2024-04-30', long: 70000, short: 30000 },
            { date: '2024-05-07', long: 68000, short: 32000 },
            { date: '2024-05-14', long: 75000, short: 25000 },
        ]
    },
    {
        currency: 'JPY',
        data: [
            { date: '2024-04-09', long: 30000, short: 150000 },
            { date: '2024-04-16', long: 28000, short: 155000 },
            { date: '2024-04-23', long: 25000, short: 160000 },
            { date: '2024-04-30', long: 20000, short: 170000 },
            { date: '2024-05-07', long: 22000, short: 165000 },
            { date: '2024-05-14', long: 18000, short: 175000 },
        ]
    }
];

export const newsData: NewsEvent[] = [
    { id: '1', time: '08:30', currency: 'USD', impact: 'High', event: 'Consumer Price Index (MoM)', actual: '0.4%', forecast: '0.3%', previous: '0.2%' },
    { id: '2', time: '10:00', currency: 'EUR', impact: 'Medium', event: 'German ZEW Economic Sentiment', actual: '47.1', forecast: '46.5', previous: '42.9' },
    { id: '3', time: '14:30', currency: 'CAD', impact: 'Low', event: 'Manufacturing Sales (MoM)', actual: '-0.2%', forecast: '0.1%', previous: '0.5%' },
    { id: '4', time: '18:00', currency: 'NZD', impact: 'High', event: 'RBNZ Interest Rate Decision', actual: null, forecast: '5.50%', previous: '5.50%' },
    { id: '5', time: '21:45', currency: 'CNY', impact: 'Medium', event: 'Caixin Services PMI', actual: null, forecast: '52.6', previous: '52.7' },
];
