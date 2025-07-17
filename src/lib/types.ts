

export type DScore = {
  id: string;
  pair: string;
  price: number;
  change: number;
  changesPercentage: number;
  dScore: number;
  grade: 'A' | 'B' | 'C';
  adxStrength: number; // 0-2.0
  bollingerBandVolatility: number; // 0-1.5
  trendAlignment: number; // 0-2.0
  srRetest: number; // 0-1.5
  priceStructure: number; // 0-1.5
  marketRegimeFit: number; // 0-2.0
  currencyStrengthIndex: number; // 0-1.0
  signal: 'Buy' | 'Sell' | 'Block';
  positions?: number;
  trends: {
    d1: 'buy' | 'sell' | 'neutral';
    w1: 'buy' | 'sell' | 'neutral';
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
type FMPQuote = {
    symbol: string;
    name: string;
    price: number;
    changesPercentage: number;
    change: number;
    dayLow: number;
    dayHigh: number;
    yearHigh: number;
    yearLow: number;
    marketCap: number | null;
    priceAvg50: number;
    priceAvg200: number;
    exchange: string;
    volume: number;
    avgVolume: number;
    open: number;
    previousClose: number;
    eps: number | null;
    pe: number | null;
    earningsAnnouncement: string | null;
    sharesOutstanding: number | null;
    timestamp: number;
};

type FMPADX = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adx: number;
    pdi: number;
    mdi: number;
};

type FMPBB = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    upperBand: number;
    middleBand: number;
    lowerBand: number;
}

type FMPATR = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    atr: number;
};

type FMPSMA = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    sma: number;
};

export type FMPHistoricalPrice = {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjClose: number;
    volume: number;
    unadjustedVolume: number;
    change: number;
    changePercent: number;
    vwap: number;
    label: string;
    changeOverTime: number;
};


export type ForexData = {
    pair: string;
    quote: FMPQuote[] | null;
    adx: FMPADX[] | null;
    atr: FMPATR[] | null;
    bb: FMPBB[] | null;
    sma50: FMPSMA[] | null;
    sma100: FMPSMA[] | null;
    sma200: FMPSMA[] | null;
    sma50_weekly: FMPSMA[] | null;
    historical: FMPHistoricalPrice[] | null;
};
