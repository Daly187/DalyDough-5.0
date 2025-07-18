
import type { FMPHistoricalPrice, ForexData, CalculatedIndicators, FMPQuote, DScore, IndicatorSet } from './types';
import { calculateIndicators } from './indicators';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY || 'RUTyEslPzCs5tHMBZUUxCr2no36EV45Q';

interface IndicatorValues {
  daily: any;
  fourHour: any;
  weekly: any;
}

interface ScoreWeights {
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
}

async function fetchWithCache<T>(url: string, ttl: number = 3600): Promise<T | null> {
    try {
        const res = await fetch(url, { next: { revalidate: ttl } });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`FMP API Error for ${url}: ${res.status} ${res.statusText} - ${errorText}`);
            return null;
        }
        
        const data = await res.json();
        
        if (!data || (data && (data['Error Message'] || data.error))) {
            console.warn(`FMP API Warning for ${url}: ${data?.['Error Message'] || data?.error || 'No data returned'}`);
            return null;
        }

        if (Array.isArray(data) && data.length === 0) {
            console.warn(`FMP API Warning for ${url}: Empty array returned.`);
            return null;
        }
        
        return data as T;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
    }
}

// Bollinger Bands calculation function
function calculateBollingerBands(prices: number[], period: number = 20, stdDevMultiplier: number = 2) {
    if (prices.length < period) {
        return 0;
    }

    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) {
        return 0.5;
    }
    
    const upperBand = sma + (stdDevMultiplier * stdDev);
    const lowerBand = sma - (stdDevMultiplier * stdDev);
    const currentPrice = prices[prices.length - 1];
    const bandWidth = upperBand - lowerBand;
    const position = bandWidth > 0 ? (currentPrice - lowerBand) / bandWidth : 0.5;
    
    return Math.max(0, Math.min(1, position));
}

// Enhanced calculateIndicators function with fixed Bollinger Bands
function calculateIndicatorsEnhanced(historicalData: FMPHistoricalPrice[], options: any = {}) {
    try {
        if (!historicalData || historicalData.length < 50) {
            return {};
        }

        const closePrices = historicalData.map(d => d.close).filter(price => price && price > 0);
        
        if (closePrices.length < 50) {
            return {};
        }

        const indicators = calculateIndicators(historicalData, options);
        const bollingerBands = calculateBollingerBands(closePrices, options.bbPeriod || 20, options.bbStdDev || 2);
        
        return {
            ...indicators,
            bollingerBands,
            price: closePrices[closePrices.length - 1] // Add current price to indicators
        };
    } catch (error) {
        console.error('Error calculating indicators:', error);
        return {};
    }
}

// SMART SCORING FUNCTIONS

function getTrendDirection(ema: number, currentPrice: number): 'up' | 'down' | 'neutral' {
    if (!ema || !currentPrice) return 'neutral';
    const diff = ((currentPrice - ema) / ema) * 100;
    if (diff > 0.05) return 'up'; // Use a small tolerance
    if (diff < -0.05) return 'down';
    return 'neutral';
}

function calculateTrendAlignment(indicators: IndicatorValues): number {
    const price = indicators.daily.price || 0;
    const trends = {
        fourHour: getTrendDirection(indicators.fourHour.ema50 || 0, price),
        daily: getTrendDirection(indicators.daily.ema50 || 0, price),
        weekly: getTrendDirection(indicators.weekly.ema50 || 0, price)
    };

    const upTrends = Object.values(trends).filter(t => t === 'up').length;
    const downTrends = Object.values(trends).filter(t => t === 'down').length;

    if (upTrends === 3 || downTrends === 3) {
        return 3.0; // All aligned
    } else if ((upTrends === 2 && downTrends === 0) || (downTrends === 2 && upTrends === 0)) {
        return 2.0; // Mostly aligned
    } else {
        return 1.0; // Mixed or weak
    }
}

function getDailyTrendDirection(indicators: IndicatorValues): 'up' | 'down' | 'neutral' {
    const price = indicators.daily.price || 0;
    const dailyEma = indicators.daily.ema50 || 0;
    return getTrendDirection(dailyEma, price);
}


function calculateAdxStrengthScore(indicators: IndicatorValues): number {
    const adxValues = [
        indicators.daily.adx || 0,
        indicators.fourHour.adx || 0,
        indicators.weekly.adx || 0
    ].filter(val => val > 0);

    if (adxValues.length === 0) return 0;
    
    const avgAdx = adxValues.reduce((sum, val) => sum + val, 0) / adxValues.length;
    
    let score = 0;
    if (avgAdx > 40) { // Stricter threshold for higher score
        score = 1.5;
    } else if (avgAdx > 25) { // Common threshold for trending
        score = 1.0;
    } else if (avgAdx > 20) {
        score = 0.5;
    }

    return score;
}

function calculateRsiMomentumScore(indicators: IndicatorValues): number {
    const rsi = indicators.daily.rsi || 50;
    
    let score = 0;
    if (rsi > 65 || rsi < 35) { // Strong momentum away from center
        score = 1.0;
    } else if (rsi > 55 || rsi < 45) { // Moderate momentum
        score = 0.6;
    } else {
        score = 0.2; // Weak/neutral
    }

    return score;
}

function calculateMacdMomentumScore(indicators: IndicatorValues): number {
    const macdItem = indicators.daily.macd;
    if (!macdItem || macdItem.macd === undefined || macdItem.histogram === undefined) return 0;
    
    // Score based on histogram expansion (momentum)
    let score = 0;
    if (Math.abs(macdItem.histogram) > Math.abs(macdItem.macd * 0.1)) { // Histogram is significant relative to MACD value
        score = 1.0;
    } else if (Math.abs(macdItem.histogram) > Math.abs(macdItem.macd * 0.05)) {
        score = 0.6;
    } else {
        score = 0.2;
    }

    return score;
}

function calculateAtrVolatilityScore(indicators: IndicatorValues): number {
    const atr = indicators.daily.atr || 0;
    const currentPrice = indicators.daily.price || 1;
    const atrPercent = atr > 0 && currentPrice > 0 ? (atr / currentPrice) * 100 : 0;
    
    let score = 0;
    if (atrPercent >= 0.5 && atrPercent <= 1.5) {
        score = 1.0; // Optimal volatility
    } else if (atrPercent > 0.3 && atrPercent < 2.5) {
        score = 0.6; // Acceptable volatility
    } else {
        score = 0.2; // Too low or too high
    }

    return score;
}

function calculateBollingerBandsScore(indicators: IndicatorValues): number {
    const bbPosition = indicators.daily.bollingerBands || 0.5;
    
    let score = 0;
    if (bbPosition > 0.9 || bbPosition < 0.1) {
        score = 0.5; // At the edges, potential reversal or breakout
    } else if (bbPosition > 0.7 || bbPosition < 0.3) {
        score = 0.3;
    } else {
        score = 0.1; // Near the middle, less clear signal
    }
    
    return score;
}

function calculateOtherIndicatorScore(value: number, name: string, maxScore: number): number {
    // Generic scoring for remaining indicators
    if (isNaN(value)) return 0;
    let score = 0;
    if (value > 0.7) {
        score = maxScore;
    } else if (value > 0.5) {
        score = maxScore * 0.6;
    } else if (value > 0.3) {
        score = maxScore * 0.3;
    } else {
        score = maxScore * 0.1;
    }
    return score;
}

// MAIN SMART SCORING FUNCTION
function calculateSmartDScore(indicators: IndicatorValues, currentPriceData: FMPQuote | null): DScore {

    const stochValue = indicators.daily.stochastic?.k ?? 50;
    const dailyTrendDirection = getDailyTrendDirection(indicators);
    
    const scores: ScoreWeights = {
        trendAlignment: calculateTrendAlignment(indicators),
        adxStrength: calculateAdxStrengthScore(indicators),
        rsiMomentum: calculateRsiMomentumScore(indicators),
        macdMomentum: calculateMacdMomentumScore(indicators),
        atrVolatility: calculateAtrVolatilityScore(indicators),
        bollingerBands: calculateBollingerBandsScore(indicators),
        stochasticOscillator: calculateOtherIndicatorScore(stochValue / 100, 'Stochastic', 0.5), // Normalize to 0-1
        parabolicSAR: calculateOtherIndicatorScore(indicators.daily.sar || 0.5, 'Parabolic SAR', 0.5),
        cci: calculateOtherIndicatorScore(indicators.daily.cci || 0.5, 'CCI', 0.5),
        obv: calculateOtherIndicatorScore(indicators.daily.obv || 0.5, 'OBV', 0.5)
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    let grade: 'A' | 'B' | 'C' = 'C';
    if (totalScore >= 8.5) grade = 'A';
    else if (totalScore >= 7.0) grade = 'B';
    
    let signal: 'Buy' | 'Sell' | 'Block' = 'Block';
    if (totalScore >= 7.0) {
        if (dailyTrendDirection === 'up') {
            signal = 'Buy';
        } else if (dailyTrendDirection === 'down') {
            signal = 'Sell';
        }
    }

    return {
        id: indicators.daily.pair || '',
        pair: indicators.daily.pair || '',
        price: currentPriceData?.price || 0,
        change: currentPriceData?.change || 0,
        changesPercentage: currentPriceData?.changesPercentage || 0,
        dScore: parseFloat(totalScore.toFixed(1)),
        grade,
        signal,
        positions: 0,
        lastUpdated: currentPriceData?.timestamp || 0,
        trendAlignment: scores.trendAlignment,
        adxStrength: scores.adxStrength,
        rsiMomentum: scores.rsiMomentum,
        macdMomentum: scores.macdMomentum,
        atrVolatility: scores.atrVolatility,
        bollingerBands: scores.bollingerBands,
        stochasticOscillator: scores.stochasticOscillator,
        parabolicSAR: scores.parabolicSAR,
        cci: scores.cci,
        obv: scores.obv
    };
}


export async function getForexData(pair: string): Promise<DScore> {
    const baseSymbol = pair.replace('/', '');
    
    const defaultScore: DScore = {
        id: pair, pair: pair, price: 0, change: 0, changesPercentage: 0, dScore: 0, grade: 'C',
        signal: 'Block', positions: 0, lastUpdated: 0, trendAlignment: 0, adxStrength: 0, rsiMomentum: 0, 
        macdMomentum: 0, atrVolatility: 0, bollingerBands: 0, stochasticOscillator: 0, parabolicSAR: 0, 
        cci: 0, obv: 0,
    };

    try {
        const quotePromise = fetchWithCache<FMPQuote[]>(`${BASE_URL}/forex/${baseSymbol}?apikey=${API_KEY}`, 10);
        const dailyPromise = fetchWithCache<{ historical: FMPHistoricalPrice[] }>(`${BASE_URL}/historical-price-full/${baseSymbol}?timeseries=350&apikey=${API_KEY}`, 3600);

        const [quoteResult, dailyDataResult] = await Promise.all([quotePromise, dailyPromise]);
        
        const quoteData = quoteResult?.[0];
        const dailyPrices = dailyDataResult?.historical;

        if (!dailyPrices || dailyPrices.length < 200) { // Increased minimum length for weekly EMA
             return {
                ...defaultScore,
                price: quoteData?.price || 0,
                change: quoteData?.change || 0,
                changesPercentage: quoteData?.changesPercentage || 0,
                lastUpdated: quoteData?.timestamp || 0
            };
        }

        // We assume 4h is roughly the same as daily for this simplified model
        const fourHourPrices = dailyPrices.slice(-100); 

        const dailyIndicators = calculateIndicatorsEnhanced(dailyPrices, { emaPeriod: 50 });
        const fourHourIndicators = calculateIndicatorsEnhanced(fourHourPrices, { emaPeriod: 50 }); 
        const weeklyIndicators = calculateIndicatorsEnhanced(dailyPrices, { emaPeriod: 200 });

        const indicators: IndicatorValues = {
            daily: { ...dailyIndicators, pair },
            fourHour: { ...fourHourIndicators, pair },
            weekly: { ...weeklyIndicators, pair }
        };
        
        const finalResult = calculateSmartDScore(indicators, quoteData || null);
        
        return finalResult;

    } catch (error) {
        console.error(`❌ Failed to process data for ${pair}:`, error);
        return defaultScore;
    }
}
