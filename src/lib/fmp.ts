
import type { DScore, FMPQuote, StrengthData } from './types';
import { calculateIndicators } from './indicators';
import { fetchHistorical, fetchQuote } from './api/fmp-api';

interface IndicatorValues {
  daily: ReturnType<typeof calculateIndicators>;
  pair: string;
}

type Direction = 'up' | 'down';

// --- TREND DIRECTION HELPERS ---
function getTrendDirection(price?: number, ema?: number): Direction | 'mixed' {
    if (price === undefined || ema === undefined) return 'mixed';
    return price >= ema ? 'up' : 'down';
}

// --- IMPROVED TREND ALIGNMENT SCORING ---
function calculateTrendAlignment(indicators: IndicatorValues): { score: number, direction: Direction | 'mixed' } {
    const { daily } = indicators;
    const price = daily.price;

    // Determine trend direction across multiple EMA periods on the daily chart
    const trendShort = getTrendDirection(price, daily.ema20);
    const trendMedium = getTrendDirection(price, daily.ema50);
    const trendLong = getTrendDirection(price, daily.ema100);

    const trends = [trendShort, trendMedium, trendLong];
    const upCount = trends.filter(t => t === 'up').length;
    const downCount = trends.filter(t => t === 'down').length;

    let score = 0;
    if (upCount === 3) {
        score = 4.0; // Perfect bullish alignment
    } else if (downCount === 3) {
        score = -4.0; // Perfect bearish alignment
    } else if (upCount === 2 && downCount <= 1) {
        score = 2.0; // Majority bullish
    } else if (downCount === 2 && upCount <= 1) {
        score = -2.0; // Majority bearish
    }

    let finalDirection: Direction | 'mixed' = 'mixed';
    if (score > 0) finalDirection = 'up';
    if (score < 0) finalDirection = 'down';
    
    return { score, direction: finalDirection };
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
    // Tiered scoring: more points for healthy (but not extreme) volatility
    if (atrPercent > 0.7) { // Very high volatility
      score = 1.0;
    } else if (atrPercent > 0.35) { // Healthy volatility
      score = 1.5;
    } else if (atrPercent > 0.15) { // Minimal volatility
      score = 0.5;
    }

    return trendDirection === 'up' ? score : -score;
}

function calculateConfirmationScore(indicators: IndicatorValues, trendDirection: Direction | 'mixed'): number {
    if (trendDirection === 'mixed') return 0;

    const price = indicators.daily.price;
    const stoch = indicators.daily.stochastic?.k;
    const sar = indicators.daily.sar;
    const cci = indicators.daily.cci;

    if (price === undefined || stoch === undefined || sar === undefined || cci === undefined) return 0;

    let confirmations = 0;
    if (trendDirection === 'up') {
        if (stoch > 20) confirmations++;
        if (sar < price) confirmations++; 
        if (cci > 0) confirmations++;
    } else { // 'down'
        if (stoch < 80) confirmations++;
        if (sar > price) confirmations++;
        if (cci < 0) confirmations++;
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
            ema20: indicators.daily.ema20,
            ema50: indicators.daily.ema50,
            ema100: indicators.daily.ema100,
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

        if (!dailyPrices || dailyPrices.length < 150) { // Need at least 100 for EMA100 plus buffer
            console.warn(`Insufficient historical data for ${pair} to calculate D-Score.`);
            return {
                ...defaultScore,
                price: quoteData?.price || 0,
                change: quoteData?.change || 0,
                changesPercentage: quoteData?.changesPercentage || 0,
                lastUpdated: quoteData?.timestamp || 0,
            };
        }

        const indicators: IndicatorValues = {
            daily: calculateIndicators(dailyPrices),
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
