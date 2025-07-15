export type DScore = {
  id: string;
  pair: string;
  dScore: number;
  cotBias: number;
  trendAlignment: number;
  adx: number;
  atrVolatility: number;
  srRetest: number;
  priceStructure: number;
  spread: number;
  marketRegimeFit: number;
  regimeMultiplier: number;
};

export type MarketRegime = {
  currencyPair: string;
  price: number;
  volatility: number;
  adx: number;
  atr: number;
  bollingerWidth: number;
  maSlopes: string;
};

export type Bot = {
  id: string;
  pair: string;
  strategy: string;
  status: 'active' | 'paused' | 'error';
  profit_loss: number;
  entry_time: string;
  d_score_entry: number;
};

export type EquityData = {
  date: string;
  equity: number;
};

export type RiskMetric = {
  label: string;
  value: string;
  description: string;
};

export type ApiKey = {
  id: string;
  name: string;
  key: string;
};
