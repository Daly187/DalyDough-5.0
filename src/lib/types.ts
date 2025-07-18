

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
  obv: number;
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

// FMP Base Types
type FMPBase = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

// FMP Indicator Types
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

export type FMPHistoricalPrice = FMPBase;
export type FMPSMA = FMPBase & { sma: number };
export type FMPEMA = FMPBase & { ema: number };
export type FMPADX = FMPBase & { adx: number; pdi: number; mdi: number };
export type FMPRSI = FMPBase & { rsi: number };
export type FMPATR = FMPBase & { atr: number };
export type FMPBB = FMPBase & { upperBand: number; middleBand: number; lowerBand: number };
export type FMPMACD = FMPBase & { macd: number; signal: number; histogram: number };
export type FMPStochastic = FMPBase & { k: number; d: number };
export type FMPSAR = FMPBase & { sar: number };
export type FMPCCI = FMPBase & { cci: number };

export type ForexData = {
    pair: string;
    quote: FMPQuote[] | null;
    historical: FMPHistoricalPrice[] | null;
    ema50d: FMPEMA[] | null;
    adx: FMPADX[] | null;
    rsi: FMPRSI[] | null;
    macd: FMPMACD[] | null;
    atr: FMPATR[] | null;
    bb: FMPBB[] | null;
    stochastic: FMPStochastic[] | null;
    sar: FMPSAR[] | null;
    cci: FMPCCI[] | null;
    ema50_4h: FMPEMA[] | null;
    ema50_w: FMPEMA[] | null;
};
