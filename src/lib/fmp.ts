
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

// --- STRENGTH INDEX CACHE ---
let strengthCache: StrengthData[] | null = null;
let strengthCacheTimestamp: number = 0;
const STRENGTH_CACHE_TTL = 1000 * 60 * 60; // 1 hour

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

    if (upTrends === 3) return { score: 4.0, direction: 'up' };
    if (downTrends === 3) return { score: -4.0, direction: 'down' };
    
    if (upTrends === 2 && downTrends <= 1) return { score: 1.5, direction: 'up' };
    if (downTrends === 2 && upTrends <= 1) return { score: -1.5, direction: 'down' };
    
    return { score: 0, direction: 'mixed' };
}

function calculateAdxStrengthScore(indicators: IndicatorValues, trendDirection: Direction | 'mixed'): number {
    const adx = indicators.daily.adx || 0;
    if (trendDirection === 'mixed') return 0;

    let score = 0;
    if (adx > 40) {
      score = 2.5; // Extremely strong trend
    } else if (adx > 25) {
      score = 1.5; // Strong trend
    } else if (adx > 20) {
      score = 0.5; // Emerging trend
    }
    
    return trendDirection === 'up' ? score : -score;
}

function calculateMacdMomentumScore(indicators: IndicatorValues, trendDirection: Direction | 'mixed'): number {
    const macdItem = indicators.daily.macd;
    if (trendDirection === 'mixed' || !macdItem || macdItem.histogram === undefined) return 0;

    const isAlignedUp = trendDirection === 'up' && macdItem.histogram > 0;
    const isAlignedDown = trendDirection === 'down' && macdItem.histogram < 0;

    if (!isAlignedUp && !isAlignedDown) return 0;
    
    const histogramAbs = Math.abs(macdItem.histogram);
    let score = 0;
    if (histogramAbs > 0.0005) { // Threshold for strong momentum, may need tuning per pair
        score = 1.0;
    } else if (histogramAbs > 0) {
        score = 0.5; // Weaker but still aligned momentum
    }
    
    return isAlignedUp ? score : -score;
}

function calculateAtrVolatilityScore(indicators: IndicatorValues, trendDirection: Direction | 'mixed'): number {
    if (trendDirection === 'mixed') return 0;

    const atr = indicators.daily.atr || 0;
    const currentPrice = indicators.daily.price || 1;
    // ATR as a percentage of price gives a normalized volatility measure
    const atrPercent = atr > 0 && currentPrice > 0 ? (atr / currentPrice) * 100 : 0;
    
    let score = 0;
    if (atrPercent > 0.7) { // Very high volatility
      score = 1.5;
    } else if (atrPercent > 0.35) { // Healthy volatility
      score = 1.3;
    } else if (atrPercent > 0.15) { // Minimal volatility
      score = 0.5;
    }

    return trendDirection === 'up' ? score : -score;
}


function calculateConfirmationScore(indicators: IndicatorValues, trendDirection: 'up' | 'down' | 'mixed'): number {
    if (trendDirection === 'mixed') return 0;

    const price = indicators.daily.price;
    const stoch = indicators.daily.stochastic?.k;
    const sar = indicators.daily.sar;
    const cci = indicators.daily.cci;
    
    if (price === undefined || stoch === undefined || sar === undefined || cci === undefined) return 0;

    let confirmations = 0;
    if (trendDirection === 'up') {
        if (stoch < 80 && stoch > 20) confirmations++; // Not overbought or oversold, good for continuation
        if (sar < price) confirmations++; // SAR is below price
        if (cci > 100) confirmations++; // CCI confirms strong upward momentum
    } else { // 'down'
        if (stoch > 20 && stoch < 80) confirmations++; // Not oversold or overbought
        if (sar > price) confirmations++; // SAR is above price
        if (cci < -100) confirmations++; // CCI confirms strong downward momentum
    }

    const score = (confirmations / 3) * 1.0; // Prorated score based on number of confirmations
    
    return trendDirection === 'up' ? score : -score;
}


async function calculateSmartDScore(indicators: IndicatorValues, currentPriceData: FMPQuote | null): Promise<DScore> {
    const trendAnalysis = calculateTrendAlignment(indicators);
    const trendDirection = trendAnalysis.direction;
    const price = currentPriceData?.price ?? indicators.daily.price ?? 0;

    const scores = {
        trendAlignment: trendAnalysis.score,
        adxStrength: calculateAdxStrengthScore(indicators, trendDirection),
        atrVolatility: calculateAtrVolatilityScore(indicators, trendDirection),
        macdMomentum: calculateMacdMomentumScore(indicators, trendDirection),
        confirmationIndicators: calculateConfirmationScore(indicators, trendDirection),
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    let grade: 'A' | 'B' | 'C' = 'C';
    const absScore = Math.abs(totalScore);
    if (absScore >= 8.5) grade = 'A';
    else if (absScore >= 7.0) grade = 'B';
    
    let finalSignal: DScore['signal'] = 'Block';
    if (totalScore >= 7.0) finalSignal = 'Buy';
    else if (totalScore <= -7.0) finalSignal = 'Sell';
    
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
        confirmationIndicators: scores.confirmationIndicators,
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
        macdMomentum: 0, atrVolatility: 0, confirmationIndicators: 0,
        rawIndicators: {}
    };

    try {
        const quotePromise = fetchQuote(baseSymbol);
        const dailyPromise = fetchHistorical(baseSymbol, 350);
        
        const [quoteResult, dailyDataResult] = await Promise.all([quotePromise, dailyPromise]);
        
        const quoteData = quoteResult?.[0] || null;
        const dailyPrices = dailyDataResult;

        if (!dailyPrices || dailyPrices.length < 200) { 
            console.warn(`Insufficient historical data for ${pair} to calculate D-Score.`);
            return {
                ...defaultScore,
                price: quoteData?.price || 0,
                change: quoteData?.change || 0,
                changesPercentage: quoteData?.changesPercentage || 0,
                lastUpdated: quoteData?.timestamp || 0,
            };
        }

        // We need enough data for 3 timeframes.
        // Daily: ~200 for all indicators
        // 4-Hour: Simulated with last 100 daily candles for faster-reacting indicators.
        // Weekly: Aggregated from daily data.
        const fourHourPrices = dailyPrices.slice(-Math.min(100, dailyPrices.length)); 
        const weeklyPrices = dailyPrices.filter((_, idx) => idx % 5 === 0).slice(-Math.min(50, Math.floor(dailyPrices.length / 5)));

        const indicators: IndicatorValues = {
            daily: calculateIndicators(dailyPrices),
            fourHour: calculateIndicators(fourHourPrices),
            weekly: calculateIndicators(weeklyPrices),
            pair
        };
        
        const finalResult = await calculateSmartDScore(indicators, quoteData);
        
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
    const now = Date.now();
    if (strengthCache && (now - strengthCacheTimestamp < STRENGTH_CACHE_TTL)) {
        return strengthCache;
    }

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
            // Fetch last 11 days to calculate 10 days of trends.
            const historicalData = await fetchHistorical(symbol, 11);

            if (!historicalData || historicalData.length < 11) {
                console.warn(`Could not fetch enough strength data for ${currency}`);
                return { currency: currency, data: [] };
            }
            
            // FMP returns newest first, reverse for oldest first for trend calculation
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

    const results = await Promise.all(promises);
    strengthCache = results;
    strengthCacheTimestamp = now;
    return results;
}
