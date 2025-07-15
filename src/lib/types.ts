
export type DScore = {
  id: string;
  pair: string;
  dScore: number;
  grade: 'A' | 'B' | 'C';
  cotBias: number; // 0-1.5
  trendAlignment: number; // 0-2.0
  adxStrength: number; // 0-1.0
  srRetest: number; // 0-1.5
  priceStructure: number; // 0-1.0
  atrVolatility: number; // 0-1.0
  marketRegimeFit: number; // 0-2.0
  regimeMultiplier: number;
  cot: number;
  adx: number;
  signal: 'Buy' | 'Sell' | 'Block';
  positions?: number;
  trends: {
    h4: 'buy' | 'sell';
    d1: 'buy' | 'sell';
    w1: 'buy' | 'sell';
  };
};

export type Bot = {
  id: string;
  pair: string;
  strategy: string;
  status: 'active' | 'paused' | 'error' | 'close_at_tp' | 'closed';
  profit_loss: number;
  drawdown: number;
  entry_time: string;
  d_score_entry: number;
  d_score_exit?: number;
  stopLoss?: number;
  takeProfit?: number;
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

export type BotScannerData = {
    minDSize: number;
    maxDSize: number;
    stopScore: number;
    stopLoss: number;
    takeProfit: number;
    maxBotsPerPair: number;
    scanInterval: number;
    autoLaunch: boolean;
    pairs: string[];
}

export type BotConfigurationData = {
  botType: string;
  lotSize: number;
  maxPositions: number;
  reentryDelay: number;
  stopLoss: number;
  takeProfit: number;
  enableDSizeExit: boolean;
  dSizeExitThreshold: number;
  enableTrailingStop: boolean;
  newsFilter: boolean;
  weekendTrading: boolean;
  aiOptimization: boolean;
  gridLevels: number;
  gridDistance: number;
  lotSizeMultiplier: number;
  takeProfitType: 'fixed' | 'average';
  closeOnRetrace: boolean;
  retracePercentage: number;
}

export type AIReentry = {
  level: number;
  priceOffset: string;
  lotSize: number;
  condition: string;
}

export type CotData = {
  currency: string;
  data: {
    date: string;
    long: number;
    short: number;
  }[];
};

export type NewsEvent = {
  id: string;
  time: string;
  currency: string;
  impact: 'High' | 'Medium' | 'Low';
  event: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
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

export type ExposureData = {
    currency: string;
    exposure: number;
    type: 'long' | 'short';
}
