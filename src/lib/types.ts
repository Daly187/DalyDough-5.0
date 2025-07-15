export type DScore = {
  id: string;
  pair: string;
  dScore: number;
  grade: 'A' | 'B' | 'C';
  cotBias: number; // 0-2
  trendConfirmation: number; // 0-3
  adxStrength: number; // 0-1
  srRetest: number; // 0-2
  priceStructure: number; // 0-1
  spreadCheck: number; // 0-1
  cot: number;
  adx: number;
  spread: number;
  signal: 'Buy' | 'Sell' | 'Block';
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

export type CotData = {
  currency: string;
  data: {
    date: string;
    long: number;
    short: number;
  }[];
}

export type NewsEvent = {
  id: string;
  time: string;
  currency: string;
  impact: 'High' | 'Medium' | 'Low';
  event: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
}
