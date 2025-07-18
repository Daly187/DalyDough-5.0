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
  rsiMomentum: number;
  macdMomentum: number;
  atrVolatility: number;
  bollingerBands: number;
  stochasticOscillator: number;
  parabolicSAR: number;
  cci: number;
  obv: number; // Will remain 0 for Forex
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
  id:string;
  name: string;
  key: string;
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
  condition: string;
}

export type StrengthData = {
  currency: string;
  data: {
    date: string;
    strength: number;
  }[];
};

export type NewsEvent = {
  id: string;
  date: string;
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

// FMP Types
export type FMPQuote = {
    ticker: string;
    bid: number;
    ask: number;
    open: number;
    low: number;
    high: number;
    changes: number;
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
    ema50?: number;
    adx?: number;
    rsi?: number;
    macd?: { macd: number; signal: number; histogram: number };
    atr?: number;
    bb?: { upper: number; middle: number; lower: number };
    stochastic?: { k: number; d: number };
    sar?: number;
    cci?: number;
};

export type CalculatedIndicators = {
    daily: IndicatorSet;
    fourHour: IndicatorSet;
    weekly: IndicatorSet;
};

export type ForexData = {
    pair: string;
    quote: FMPQuote | null;
    indicators: CalculatedIndicators;
};
