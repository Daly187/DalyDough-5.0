
import type { DScore, FMPQuote, StrengthData } from './types';
import { calculateIndicators } from './indicators';
import { fetchHistorical, fetchQuote } from './api/fmp-api';

interface IndicatorValues {
  daily: ReturnType<typeof calculateIndicators>;
  fourHour: ReturnType<typeof calculateIndicators>;
  weekly: ReturnType<typeof calculateIndicators>;
  pair: string;
}

// SMART SCORING FUNCTIONS
function getTrendDirection(price?: number, ema?: number): 'up' | 'down' {
    if (price === undefined || ema === undefined) return 'down';
    return price >= ema ? 'up' : 'down';
}

function calculateTrendAlignment(indicators: IndicatorValues): { score: number, direction: 'up' | 'down' | 'mixed', signal: 'Buy' | 'Sell' | 'Block' | 'Buy weak' | 'Sell weak' } {
    const price4h = indicators.fourHour.price;
    const price1d = indicators.daily.price;
    const price1w = indicators.weekly.price;

    const trends = [
        getTrendDirection(price4h, indicators.fourHour.ema50),
        getTrendDirection(price1d, indicators.daily.ema50),
        getTrendDirection(price1w, indicators.weekly.ema50)
    ];

    const upTrends = trends.filter(t => t === 'up').length;
    const downTrends = trends.filter(t => t === 'down').length;

    if (upTrends === 3) {
        return { score: 3.0, direction: 'up', signal: 'Buy' };
    }
    if (downTrends === 3) {
        return { score: 3.0, direction: 'down', signal: 'Sell' };
    }
    if (upTrends === 2 && downTrends === 0) {
        return { score: 2.0, direction: 'up', signal: 'Buy weak' };
    }
    if (downTrends === 2 && upTrends === 0) {
        return { score: 2.0, direction: 'down', signal: 'Sell weak' };
    }
    
    return { score: 1.0, direction: 'mixed', signal: 'Block' };
}


function calculateAdxStrengthScore(indicators: IndicatorValues): number {
    const adx = indicators.daily.adx || 0;
    
    let score = 0;
    if (adx > 40) { 
        score = 1.5;
    } else if (adx > 25) { 
        score = 1.0;
    } else if (adx > 20) {
        score = 0.5;
    }

    return score;
}

function calculateRsiMomentumScore(indicators: IndicatorValues): number {
    const rsi = indicators.daily.rsi || 50;
    
    let score = 0;
    if (rsi > 65 || rsi < 35) { 
        score = 1.0;
    } else if (rsi > 55 || rsi < 45) {
        score = 0.6;
    } else {
        score = 0.2;
    }

    return score;
}

function calculateMacdMomentumScore(indicators: IndicatorValues): number {
    const macdItem = indicators.daily.macd;
    if (!macdItem || macdItem.macd === undefined || macdItem.histogram === undefined) return 0;
    
    const isAligned = (macdItem.macd > 0 && macdItem.histogram > 0) || (macdItem.macd < 0 && macdItem.histogram < 0);
    
    if (isAligned) {
      if (Math.abs(macdItem.histogram) > Math.abs(macdItem.macd * 0.1)) {
          return 1.0;
      } else {
          return 0.6;
      }
    }
    return 0.2;
}

function calculateAtrVolatilityScore(indicators: IndicatorValues): number {
    const atr = indicators.daily.atr || 0;
    const currentPrice = indicators.daily.price || 1;
    const atrPercent = atr > 0 && currentPrice > 0 ? (atr / currentPrice) * 100 : 0;
    
    let score = 0;
    if (atrPercent >= 0.5 && atrPercent <= 1.5) {
        score = 1.0;
    } else if (atrPercent > 0.3 && atrPercent < 2.5) {
        score = 0.6;
    } else {
        score = 0.2;
    }

    return score;
}

function calculateBollingerBandsScore(indicators: IndicatorValues): number {
    const bb = indicators.daily.bb;
    const price = indicators.daily.price;

    if (!bb || !price) return 0;

    const { upper, lower } = bb;
    if (!upper || !lower) return 0;
    
    const bandWidth = upper - lower;
    if (bandWidth <= 0) return 0.1;

    const position = (price - lower) / bandWidth;

    if (position > 0.95 || position < 0.05) {
        return 0.5; 
    } else if (position > 0.8 || position < 0.2) {
        return 0.3;
    }
    
    return 0.1;
}

function calculateOtherIndicatorScore(value: number | undefined, name: string, maxScore: number): number {
    if (typeof value !== 'number' || isNaN(value)) {
        return 0;
    }

    let normalizedValue = 0;
    if (name === 'stochastic') normalizedValue = value / 100;
    if (name === 'cci') normalizedValue = (value + 100) / 200;

    let score = 0;
    if (normalizedValue > 0.7) {
        score = maxScore;
    } else if (normalizedValue > 0.5) {
        score = maxScore * 0.6;
    } else if (normalizedValue > 0.3) {
        score = maxScore * 0.3;
    } else {
        score = maxScore * 0.1;
    }
    return score;
}


function calculateSmartDScore(indicators: IndicatorValues, currentPriceData: FMPQuote | null): DScore {

    const trendAnalysis = calculateTrendAlignment(indicators);
    const stochValue = indicators.daily.stochastic?.k ?? 50;

    const scores = {
        trendAlignment: trendAnalysis.score,
        adxStrength: calculateAdxStrengthScore(indicators),
        rsiMomentum: calculateRsiMomentumScore(indicators),
        macdMomentum: calculateMacdMomentumScore(indicators),
        atrVolatility: calculateAtrVolatilityScore(indicators),
        bollingerBands: calculateBollingerBandsScore(indicators),
        stochasticOscillator: calculateOtherIndicatorScore(stochValue, 'stochastic', 0.5),
        parabolicSAR: 0, 
        cci: calculateOtherIndicatorScore(indicators.daily.cci, 'cci', 0.5),
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    let grade: 'A' | 'B' | 'C' = 'C';
    if (totalScore >= 8.5) grade = 'A';
    else if (totalScore >= 7.0) grade = 'B';
    
    let finalSignal = trendAnalysis.signal;
    if (totalScore < 7.0 && (finalSignal === 'Buy' || finalSignal === 'Sell' || finalSignal === 'Buy weak' || finalSignal === 'Sell weak')) {
        finalSignal = 'Block';
    }
    
    // Prioritize live data, but if unavailable, explicitly mark it as such.
    const price = currentPriceData?.price ?? 0;
    const change = currentPriceData?.change ?? 0;
    const changesPercentage = currentPriceData?.changesPercentage ?? 0;
    const lastUpdated = currentPriceData?.timestamp ?? 0;

    return {
        id: indicators.pair,
        pair: indicators.pair,
        price,
        change,
        changesPercentage,
        dScore: parseFloat(totalScore.toFixed(1)),
        grade,
        signal: finalSignal,
        positions: 0,
        lastUpdated,
        trendAlignment: scores.trendAlignment,
        adxStrength: scores.adxStrength,
        rsiMomentum: scores.rsiMomentum,
        macdMomentum: scores.macdMomentum,
        atrVolatility: scores.atrVolatility,
        bollingerBands: scores.bollingerBands,
        stochasticOscillator: scores.stochasticOscillator,
        parabolicSAR: scores.parabolicSAR,
        cci: scores.cci,
        obv: 0, // Will remain 0 for Forex
        rawIndicators: {
            ema50: indicators.daily.ema50,
            adx: indicators.daily.adx,
            rsi: indicators.daily.rsi,
            macd: indicators.daily.macd,
            atr: indicators.daily.atr,
            bb: indicators.daily.bb,
            stochastic: indicators.daily.stochastic,
            sar: indicators.daily.sar,
            cci: indicators.daily.cci,
        }
    };
}


export async function getForexData(pair: string): Promise<DScore> {
    const baseSymbol = pair.replace('/', '');
    
    const defaultScore: DScore = {
        id: pair, pair: pair, price: 0, change: 0, changesPercentage: 0, dScore: 0, grade: 'C',
        signal: 'Block', positions: 0, lastUpdated: 0, trendAlignment: 0, adxStrength: 0, rsiMomentum: 0, 
        macdMomentum: 0, atrVolatility: 0, bollingerBands: 0, stochasticOscillator: 0, parabolicSAR: 0, 
        cci: 0, obv: 0, rawIndicators: {}
    };

    try {
        const quotePromise = fetchQuote(baseSymbol);
        const dailyPromise = fetchHistorical(baseSymbol, 350);
        
        const [quoteResult, dailyDataResult] = await Promise.all([quotePromise, dailyPromise]);
        
        const quoteData = quoteResult?.[0] || null; // Ensure quoteData is null if not found
        const dailyPrices = dailyDataResult;

        if (!dailyPrices || dailyPrices.length < 200) { 
             return {
                ...defaultScore,
                price: quoteData?.price || 0,
                change: quoteData?.change || 0,
                changesPercentage: quoteData?.changesPercentage || 0,
                lastUpdated: quoteData?.timestamp || 0
            };
        }

        const fourHourPrices = dailyPrices.slice(-100); 
        const weeklyPrices = dailyPrices.filter((_, idx) => idx % 5 === 0);

        const indicators: IndicatorValues = {
            daily: calculateIndicators(dailyPrices),
            fourHour: calculateIndicators(fourHourPrices),
            weekly: calculateIndicators(weeklyPrices),
            pair
        };
        
        const finalResult = calculateSmartDScore(indicators, quoteData);
        
        return finalResult;

    } catch (error) {
        console.error(`❌ Failed to process data for ${pair}:`, error);
        return defaultScore;
    }
}


export async function getStrengthData(): Promise<StrengthData[]> {
    const currencyIndexes = {
        'USD': '^DXY',
        'EUR': '^EXY',
        'JPY': '^JXY', 
        'GBP': '^BXY',
        'AUD': '^AXY',
        'CAD': '^CXY', 
        'CHF': '^SXY', 
        'NZD': '^ZXY'
    };

    const promises = Object.entries(currencyIndexes).map(async ([currency, symbol]) => {
        const historicalData = await fetchHistorical(symbol, 11);

        if (!historicalData) {
            return { currency: `${currency} (${symbol.replace('^', '')})`, data: [] };
        }
        
        const data = historicalData.map(item => ({
            date: item.date,
            strength: item.close
        })).reverse(); 

        return { currency: `${currency} (${symbol.replace('^', '')})`, data };
    });

    return Promise.all(promises);
}
