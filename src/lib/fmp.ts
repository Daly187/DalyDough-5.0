
import type { DScore, FMPQuote, StrengthData } from './types';
import { calculateIndicators } from './indicators';
import { fetchHistorical, fetchQuote } from './api/fmp-api';

interface IndicatorValues {
  daily: ReturnType<typeof calculateIndicators>;
  fourHour: ReturnType<typeof calculateIndicators>;
  weekly: ReturnType<typeof calculateIndicators>;
  pair: string;
}

type Direction = 'up' | 'down';

// SMART SCORING FUNCTIONS
function getTrendDirection(price?: number, ema?: number): Direction | 'mixed' {
    if (price === undefined || ema === undefined) return 'mixed';
    return price >= ema ? 'up' : 'down';
}

function calculateTrendAlignment(indicators: IndicatorValues): { score: number, direction: Direction | 'mixed' } {
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

    if (upTrends === 3) return { score: 3.0, direction: 'up' };
    if (downTrends === 3) return { score: -3.0, direction: 'down' };
    if (upTrends === 2 && downTrends === 1) return { score: 1.5, direction: 'up' };
    if (downTrends === 2 && upTrends === 1) return { score: -1.5, direction: 'down' };
    
    return { score: 0, direction: 'mixed' };
}

function calculateAdxStrengthScore(indicators: IndicatorValues, trendDirection: Direction | 'mixed'): number {
    const adx = indicators.daily.adx || 0;
    if (trendDirection === 'mixed') return 0;

    let score = 0;
    if (adx > 40) score = 1.5;
    else if (adx > 25) score = 1.0;
    else if (adx > 20) score = 0.5;

    return trendDirection === 'up' ? score : -score;
}

function calculateMacdMomentumScore(indicators: IndicatorValues, trendDirection: Direction | 'mixed'): number {
    const macdItem = indicators.daily.macd;
    if (trendDirection === 'mixed' || !macdItem || macdItem.histogram === undefined) return 0;

    const isAlignedUp = trendDirection === 'up' && macdItem.histogram > 0;
    const isAlignedDown = trendDirection === 'down' && macdItem.histogram < 0;

    if (!isAlignedUp && !isAlignedDown) return 0;
    
    let score = Math.abs(macdItem.histogram) > 0.0001 ? 1.0 : 0.5;
    
    return isAlignedUp ? score : -score;
}

function calculateAtrVolatilityScore(indicators: IndicatorValues, trendDirection: Direction | 'mixed'): number {
    if (trendDirection === 'mixed') return 0;

    const atr = indicators.daily.atr || 0;
    const currentPrice = indicators.daily.price || 1;
    const atrPercent = atr > 0 && currentPrice > 0 ? (atr / currentPrice) * 100 : 0;
    
    let score = 0;
    if (atrPercent >= 0.5 && atrPercent <= 1.5) score = 1.0;
    else if (atrPercent > 0.3 && atrPercent < 2.5) score = 0.6;
    else score = 0.2;

    return trendDirection === 'up' ? score : -score;
}


function calculateOtherIndicatorScore(value: number | undefined, trendDirection: 'up' | 'down' | 'mixed', upCondition: (v:number) => boolean, downCondition: (v:number) => boolean): number {
    if (trendDirection === 'mixed' || typeof value !== 'number' || isNaN(value)) {
        return 0;
    }
    
    const score = 0.5;
    if (trendDirection === 'up' && upCondition(value)) {
        return score;
    }
    if (trendDirection === 'down' && downCondition(value)) {
        return -score;
    }
    return 0;
}


function calculateSmartDScore(indicators: IndicatorValues, currentPriceData: FMPQuote | null): DScore {
    const trendAnalysis = calculateTrendAlignment(indicators);
    const trendDirection = trendAnalysis.direction;
    const price = currentPriceData?.price ?? indicators.daily.price ?? 0;
    
    const scores = {
        trendAlignment: trendAnalysis.score,
        adxStrength: calculateAdxStrengthScore(indicators, trendDirection),
        macdMomentum: calculateMacdMomentumScore(indicators, trendDirection),
        atrVolatility: calculateAtrVolatilityScore(indicators, trendDirection),
        stochasticOscillator: calculateOtherIndicatorScore(indicators.daily.stochastic?.k, trendDirection, v => v < 80, v => v > 20),
        parabolicSAR: calculateOtherIndicatorScore(indicators.daily.sar, trendDirection, v => v < price, v => v > price),
        cci: calculateOtherIndicatorScore(indicators.daily.cci, trendDirection, v => v > 0, v => v < 0),
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    let grade: 'A' | 'B' | 'C' = 'C';
    const absScore = Math.abs(totalScore);
    if (absScore >= 8.5) grade = 'A';
    else if (absScore >= 7.0) grade = 'B';
    
    let finalSignal: DScore['signal'];
    if (totalScore >= 7.0) finalSignal = 'Buy';
    else if (totalScore <= -7.0) finalSignal = 'Sell';
    else if (totalScore > 0) finalSignal = 'Buy weak';
    else if (totalScore < 0) finalSignal = 'Sell weak';
    else finalSignal = 'Block';
    
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
        macdMomentum: scores.macdMomentum,
        atrVolatility: scores.atrVolatility,
        stochasticOscillator: scores.stochasticOscillator,
        parabolicSAR: scores.parabolicSAR,
        cci: scores.cci,
        obv: 0, 
        rawIndicators: {
            ema50: indicators.daily.ema50,
            adx: indicators.daily.adx,
            macd: indicators.daily.macd,
            atr: indicators.daily.atr,
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
        signal: 'Block', positions: 0, lastUpdated: 0, trendAlignment: 0, adxStrength: 0, 
        macdMomentum: 0, atrVolatility: 0, stochasticOscillator: 0, parabolicSAR: 0, 
        cci: 0, obv: 0, rawIndicators: {}
    };

    try {
        const quotePromise = fetchQuote(baseSymbol);
        const dailyPromise = fetchHistorical(baseSymbol, 350);
        
        const [quoteResult, dailyDataResult] = await Promise.all([quotePromise, dailyPromise]);
        
        const quoteData = quoteResult?.[0] || null;
        const dailyPrices = dailyDataResult;

        if (!dailyPrices || dailyPrices.length < 200) { 
            return {
                ...defaultScore,
                price: quoteData?.price || 0,
                change: quoteData?.change || 0,
                changesPercentage: quoteData?.changesPercentage || 0,
                lastUpdated: quoteData?.timestamp || 0,
            };
        }

        const fourHourPrices = dailyPrices.slice(-Math.min(100, dailyPrices.length)); 
        const weeklyPrices = dailyPrices.filter((_, idx) => idx % 5 === 0).slice(-Math.min(50, Math.floor(dailyPrices.length / 5)));

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
        return {
            ...defaultScore,
            signal: 'Block'
        };
    }
}

export async function getStrengthData(): Promise<StrengthData[]> {
    const currencyIndexes = {
        'USD (DXY)': '^DXY',
        'EUR (EXY)': '^EXY',
        'JPY (JXY)': '^JXY', 
        'GBP (BXY)': '^BXY',
        'AUD (AXY)': '^AXY',
        'CAD (CXY)': '^CXY', 
        'CHF (SXY)': '^SXY', 
        'NZD (ZXY)': '^ZXY'
    };

    const promises = Object.entries(currencyIndexes).map(async ([currency, symbol]) => {
        try {
            const historicalData = await fetchHistorical(symbol, 11);

            if (!historicalData || historicalData.length === 0) {
                return { currency: currency, data: [] };
            }
            
            const data = historicalData.map(item => ({
                date: item.date,
                strength: item.close
            })).reverse(); 

            return { currency: currency, data };
        } catch (error) {
            console.error(`❌ Failed to fetch strength data for ${currency}:`, error);
            return { currency: currency, data: [] };
        }
    });

    return Promise.all(promises);
}
