
export type DScore = {
  id: string;
  pair: string;
  price: number;
  change: number;
  changesPercentage: number;
  dScore: number;
  grade: 'A' | 'B' | 'C';
  signal: 'Buy' | 'Sell' | 'Block';
  positions?: number;
  lastUpdated: number;
  
  // Score components
  trendAlignment: number;
  adxStrength: number;
  macdMomentum: number;
  atrVolatility: number;
  confirmationIndicators: number;

  rawIndicators: Partial<IndicatorSet>;
};

export type Bot = {
  id: string;
  pair: string;
  strategy: string;
  status: 'active' | 'paused' | 'error' | 'close_at_tp' | 'closed';
  profit_loss: number;
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
  id:string;
  name: string;
  key: string;
};

export type TradeAccount = {
  id: string; // Unique Account Number for MT5
  nickname: string;
  broker: string;
  balance: number;
  equity: number;
  status: 'Connected' | 'Disconnected' | 'Error';
  isPrimary: boolean;
  copySettings?: {
    enabled: boolean;
    weight: number;
  };
};

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
  trailingStopPips: number;
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
  condition:string;
}

export type StrengthData = {
  currency: string;
  data: {
    date: string;
    strength: number; 
  }[];
};

export type NewsEvent = {
  date: string; // ISO 8601 format "YYYY-MM-DD HH:MM:SS"
  country: string;
  currency: string;
  impact: 'High' | 'Medium' | 'Low' | string; // FMP can return other strings
  eventName: string;
  actual: string | null;
  previous: string | null;
  estimate: string | null;
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

// FMP Types
export type FMPQuote = {
    symbol: string;
    name?: string;
    bid?: number;
    ask?: number;
    price: number;
    change: number;
    changesPercentage: number;
    timestamp: number;
};

export type FMPHistoricalPrice = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

// Locally Calculated Indicator Types
export type IndicatorSet = {
    price?: number;
    ema20?: number;
    ema50?: number;
    ema100?: number;
    adx?: number;
    macd?: { macd?: number; signal?: number; histogram?: number };
    atr?: number;
    stochastic?: { k: number; d: number };
    sar?: number;
    cci?: number;
};
