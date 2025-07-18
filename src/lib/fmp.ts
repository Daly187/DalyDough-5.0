import type { FMPHistoricalPrice, ForexData, CalculatedIndicators, FMPQuote, DScore } from './types';
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

const MAX_WEIGHTS: ScoreWeights = {
  trendAlignment: 3.0,
  adxStrength: 1.5,
  rsiMomentum: 1.0,
  macdMomentum: 1.0,
  atrVolatility: 1.0,
  bollingerBands: 0.5,
  stochasticOscillator: 0.5,
  parabolicSAR: 0.5,
  cci: 0.5,
  obv: 0.5
};

async function fetchWithCache<T>(url: string, ttl: number = 3600): Promise<T | null> {
    try {
        console.log(`Fetching from URL: ${url}`);
        const res = await fetch(url, { next: { revalidate: ttl } });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error(`FMP API Error for ${url}: ${res.status} ${res.statusText} - ${errorText}`);
            return null;
        }
        
        const data = await res.json();
        console.log(`Raw data received for ${url}:`, JSON.stringify(data).slice(0, 200) + '...');
        
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
        console.warn(`Not enough data for Bollinger Bands: need ${period}, got ${prices.length}`);
        return 0;
    }

    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) {
        console.warn('Standard deviation is 0 for Bollinger Bands');
        return 0.5;
    }
    
    const upperBand = sma + (stdDevMultiplier * stdDev);
    const lowerBand = sma - (stdDevMultiplier * stdDev);
    const currentPrice = prices[prices.length - 1];
    const bandWidth = upperBand - lowerBand;
    const position = bandWidth > 0 ? (currentPrice - lowerBand) / bandWidth : 0.5;
    
    console.log(`Bollinger Bands calculation:`, {
        period,
        currentPrice: currentPrice.toFixed(6),
        sma: sma.toFixed(6),
        stdDev: stdDev.toFixed(6),
        upperBand: upperBand.toFixed(6),
        lowerBand: lowerBand.toFixed(6),
        position: position.toFixed(3)
    });
    
    return Math.max(0, Math.min(1, position));
}

// Enhanced calculateIndicators function with fixed Bollinger Bands
function calculateIndicatorsEnhanced(historicalData: FMPHistoricalPrice[], options: any = {}) {
    try {
        const closePrices = historicalData
            .map(d => d.close)
            .filter(price => price && price > 0);
        
        if (closePrices.length < 50) {
            console.warn(`Insufficient valid price data: ${closePrices.length}`);
            return {};
        }

        console.log(`Calculating indicators with ${closePrices.length} data points`);
        console.log(`Price range: ${Math.min(...closePrices).toFixed(6)} - ${Math.max(...closePrices).toFixed(6)}`);

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
    if (diff > 0.1) return 'up';
    if (diff < -0.1) return 'down';
    return 'neutral';
}

function calculateTrendAlignmentScore(indicators: IndicatorValues): number {
    const trends = {
        fourHour: getTrendDirection(indicators.fourHour.ema || 0, indicators.fourHour.price || indicators.daily.price || 0),
        daily: getTrendDirection(indicators.daily.ema || 0, indicators.daily.price || 0),
        weekly: getTrendDirection(indicators.weekly.ema || 0, indicators.weekly.price || indicators.daily.price || 0)
    };

    const upTrends = Object.values(trends).filter(t => t === 'up').length;
    const downTrends = Object.values(trends).filter(t => t === 'down').length;

    let score = 0;
    
    if (upTrends === 3 || downTrends === 3) {
        score = 3.0; // All aligned
    } else if (upTrends === 2 || downTrends === 2) {
        score = 2.0; // 2 aligned
    } else if (upTrends === 1 || downTrends === 1) {
        score = 1.0; // 1 aligned
    } else {
        score = 0; // No alignment
    }

    console.log(`Trend Alignment: 4H=${trends.fourHour}, 1D=${trends.daily}, 1W=${trends.weekly} → Score: ${score}/3.0`);
    return score;
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
    if (avgAdx > 50) {
        score = 1.5; // Very strong
    } else if (avgAdx > 30) {
        score = 1.0; // Strong
    } else if (avgAdx > 20) {
        score = 0.5; // Moderate
    } else {
        score = 0; // Weak
    }

    console.log(`ADX Strength: Avg=${avgAdx.toFixed(1)} → Score: ${score}/1.5`);
    return score;
}

function calculateRsiMomentumScore(indicators: IndicatorValues): number {
    const rsi = indicators.daily.rsi || 50;
    
    let score = 0;
    if (rsi > 70 || rsi < 30) {
        score = 1.0; // Strong momentum
    } else if (rsi > 60 || rsi < 40) {
        score = 0.6; // Moderate momentum
    } else {
        score = 0.2; // Weak momentum
    }

    console.log(`RSI Momentum: ${rsi.toFixed(1)} → Score: ${score}/1.0`);
    return score;
}

function calculateMacdMomentumScore(indicators: IndicatorValues): number {
    const macd = indicators.daily.macd || 0;
    const macdSignal = indicators.daily.macdSignal || 0;
    const histogram = macd - macdSignal;
    
    let score = 0;
    if (Math.abs(histogram) > 0.001) {
        score = 1.0; // Strong
    } else if (Math.abs(histogram) > 0.0005) {
        score = 0.6; // Moderate
    } else {
        score = 0.2; // Weak
    }

    console.log(`MACD Momentum: Histogram=${histogram.toFixed(6)} → Score: ${score}/1.0`);
    return score;
}

function calculateAtrVolatilityScore(indicators: IndicatorValues): number {
    const atr = indicators.daily.atr || 0;
    const currentPrice = indicators.daily.price || 1;
    const atrPercent = (atr / currentPrice) * 100;
    
    let score = 0;
    if (atrPercent >= 0.5 && atrPercent <= 1.5) {
        score = 1.0; // Optimal
    } else if (atrPercent >= 0.3 && atrPercent <= 2.0) {
        score = 0.6; // Moderate
    } else {
        score = 0.2; // Too low/high
    }

    console.log(`ATR Volatility: ${atrPercent.toFixed(2)}% → Score: ${score}/1.0`);
    return score;
}

function calculateBollingerBandsScore(indicators: IndicatorValues): number {
    const bbPosition = indicators.daily.bollingerBands || 0.5;
    
    let score = 0;
    if (bbPosition > 0.8 || bbPosition < 0.2) {
        score = 0.5; // Near bands
    } else if (bbPosition > 0.6 || bbPosition < 0.4) {
        score = 0.3; // Moderate
    } else {
        score = 0.1; // Neutral
    }

    console.log(`Bollinger Bands: Position=${bbPosition.toFixed(2)} → Score: ${score}/0.5`);
    return score;
}

function calculateOtherIndicatorScore(value: number, name: string, maxScore: number): number {
    // Generic scoring for remaining indicators
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
    
    console.log(`${name}: ${value.toFixed(2)} → Score: ${score.toFixed(2)}/${maxScore}`);
    return score;
}

// MAIN SMART SCORING FUNCTION
function calculateSmartDScore(indicators: IndicatorValues, currentPriceData: FMPQuote | null): DScore {
    console.log('\n🎯 Calculating Smart D-Score...\n');

    const scores: ScoreWeights = {
        trendAlignment: calculateTrendAlignmentScore(indicators),
        adxStrength: calculateAdxStrengthScore(indicators),
        rsiMomentum: calculateRsiMomentumScore(indicators),
        macdMomentum: calculateMacdMomentumScore(indicators),
        atrVolatility: calculateAtrVolatilityScore(indicators),
        bollingerBands: calculateBollingerBandsScore(indicators),
        stochasticOscillator: calculateOtherIndicatorScore(indicators.daily.stochastic || 0.5, 'Stochastic', 0.5),
        parabolicSAR: calculateOtherIndicatorScore(indicators.daily.parabolicSAR || 0.5, 'Parabolic SAR', 0.5),
        cci: calculateOtherIndicatorScore(indicators.daily.cci || 0.5, 'CCI', 0.5),
        obv: calculateOtherIndicatorScore(indicators.daily.obv || 0.5, 'OBV', 0.5)
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxScore = Object.values(MAX_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    const percentage = (totalScore / maxScore) * 100;

    // Grade assignment
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    // Signal assignment
    let signal = 'Block';
    if (percentage >= 75) signal = 'Strong Buy';
    else if (percentage >= 60) signal = 'Buy';
    else if (percentage >= 40) signal = 'Hold';
    else if (percentage >= 25) signal = 'Sell';

    console.log('\n📊 Smart D-Score Results:');
    console.log('Individual Scores:', scores);
    console.log(`Total Score: ${totalScore.toFixed(2)}/${maxScore.toFixed(2)} (${percentage.toFixed(1)}%)`);
    console.log(`Grade: ${grade}, Signal: ${signal}\n`);

    return {
        id: indicators.daily.pair || '',
        pair: indicators.daily.pair || '',
        price: currentPriceData?.price || indicators.daily.price || 0,
        change: currentPriceData?.change || 0,
        changesPercentage: currentPriceData?.changesPercentage || 0,
        dScore: parseFloat(percentage.toFixed(1)),
        grade,
        signal,
        positions: 0,
        lastUpdated: Date.now(),
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

// Separate function to get current price data
async function getCurrentForexPrice(symbol: string): Promise<FMPQuote | null> {
    const endpoints = [
        `${BASE_URL}/fx/${symbol}?apikey=${API_KEY}`,
        `${BASE_URL}/quote/${symbol}?apikey=${API_KEY}`,
        `${BASE_URL}/forex/${symbol}?apikey=${API_KEY}`,
        `${BASE_URL}/fx/${symbol}=X?apikey=${API_KEY}`,
        `${BASE_URL}/quote/${symbol}=X?apikey=${API_KEY}`
    ];

    for (const endpoint of endpoints) {
        console.log(`Trying current price endpoint: ${endpoint}`);
        const data = await fetchWithCache<FMPQuote[]>(endpoint, 60);
        
        if (data && data.length > 0 && data[0].price && data[0].price > 0) {
            console.log(`✅ Got valid current price from: ${endpoint}`, {
                price: data[0].price,
                change: data[0].change,
                symbol: data[0].symbol
            });
            return data[0];
        } else if (data && data.length > 0) {
            console.log(`⚠️ Got response but invalid price data:`, data[0]);
        }
    }
    
    console.warn(`❌ No valid current price data found for ${symbol}`);
    return null;
}

// Separate function to get historical data
async function getHistoricalForexData(symbol: string): Promise<FMPHistoricalPrice[] | null> {
    const endpoints = [
        `${BASE_URL}/historical-price-full/${symbol}?timeseries=350&apikey=${API_KEY}`,
        `${BASE_URL}/historical-price-full/${symbol}=X?timeseries=350&apikey=${API_KEY}`,
        `${BASE_URL}/historical-chart/1day/${symbol}?from=2024-01-01&apikey=${API_KEY}`,
        `${BASE_URL}/historical-chart/1day/${symbol}=X?from=2024-01-01&apikey=${API_KEY}`
    ];

    for (const endpoint of endpoints) {
        console.log(`Trying historical data endpoint: ${endpoint}`);
        const data = await fetchWithCache<{ historical: FMPHistoricalPrice[] } | FMPHistoricalPrice[]>(endpoint, 3600);
        
        if (data) {
            let historicalData: FMPHistoricalPrice[];
            
            if (Array.isArray(data)) {
                historicalData = data;
            } else if (data.historical && Array.isArray(data.historical)) {
                historicalData = data.historical;
            } else {
                console.log(`Unexpected data format from ${endpoint}:`, Object.keys(data));
                continue;
            }
            
            const validData = historicalData.filter(item => 
                item.close && item.close > 0 && 
                item.high && item.high > 0 && 
                item.low && item.low > 0
            );
            
            if (validData.length > 50) {
                console.log(`✅ Got ${validData.length} valid historical records from: ${endpoint}`);
                console.log(`Sample data:`, {
                    date: validData[0].date,
                    close: validData[0].close,
                    high: validData[0].high,
                    low: validData[0].low
                });
                return validData;
            } else {
                console.log(`⚠️ Not enough valid data points: ${validData.length}`);
            }
        }
    }
    
    console.warn(`❌ No valid historical data found for ${symbol}`);
    return null;
}

export async function getForexData(pair: string): Promise<DScore> {
    const baseSymbol = pair.replace('/', '');
    const symbols = [baseSymbol, `${baseSymbol}=X`, `${baseSymbol}.FOREX`];
    
    console.log(`\n=== Processing ${pair} ===`);
    console.log(`Trying symbols: ${symbols.join(', ')}`);
    
    const defaultScore: DScore = {
        id: pair, 
        pair: pair, 
        price: 0, 
        change: 0, 
        changesPercentage: 0, 
        dScore: 0, 
        grade: 'C',
        signal: 'Block', 
        positions: 0, 
        lastUpdated: Date.now(),
        trendAlignment: 0, 
        adxStrength: 0, 
        rsiMomentum: 0, 
        macdMomentum: 0,
        atrVolatility: 0, 
        bollingerBands: 0, 
        stochasticOscillator: 0, 
        parabolicSAR: 0, 
        cci: 0, 
        obv: 0,
    };

    let currentPriceData: FMPQuote | null = null;
    let historicalData: FMPHistoricalPrice[] | null = null;

    for (const symbol of symbols) {
        console.log(`\n--- Trying symbol: ${symbol} ---`);
        
        if (!currentPriceData) {
            console.log('Step 1: Fetching current price data...');
            currentPriceData = await getCurrentForexPrice(symbol);
        }
        
        if (!historicalData) {
            console.log('Step 2: Fetching historical data...');
            historicalData = await getHistoricalForexData(symbol);
        }
        
        if (currentPriceData && historicalData) {
            console.log(`✅ Successfully got both current and historical data for ${symbol}`);
            break;
        }
    }

    try {
        if (!currentPriceData && historicalData && historicalData.length > 0) {
            console.log('📊 Using latest historical price as current price fallback');
            const latestData = historicalData[0];
            currentPriceData = {
                price: latestData.close,
                change: latestData.close - (historicalData[1]?.close || latestData.close),
                changesPercentage: historicalData[1] ? 
                    ((latestData.close - historicalData[1].close) / historicalData[1].close) * 100 : 0,
                symbol: baseSymbol
            } as FMPQuote;
        }
        
        if (!historicalData || historicalData.length < 50) {
            console.warn(`⚠️ Insufficient historical data for ${pair} (got ${historicalData?.length || 0} records, need at least 50)`);
            return {
                ...defaultScore,
                price: currentPriceData?.price || 0,
                change: currentPriceData?.change || 0,
                changesPercentage: currentPriceData?.changesPercentage || 0,
                lastUpdated: currentPriceData ? Date.now() : 0
            };
        }
        
        console.log(`\n📈 Calculating indicators from ${historicalData.length} data points...`);
        console.log(`Price range: ${Math.min(...historicalData.map(d => d.close))} - ${Math.max(...historicalData.map(d => d.close))}`);
        
        const dailyIndicators = calculateIndicatorsEnhanced(historicalData, {
            emaPeriod: 50,
            adxPeriod: 14,
            rsiPeriod: 14,
            macdFast: 12,
            macdSlow: 26,
            macdSignal: 9,
            atrPeriod: 14,
            bbPeriod: 20,
            bbStdDev: 2,
            stochKPeriod: 14,
            stochDPeriod: 3,
            cciPeriod: 20
        });
        
        const fourHourIndicators = calculateIndicatorsEnhanced(historicalData);
        const weeklyIndicators = calculateIndicatorsEnhanced(historicalData, { emaPeriod: 50 });

        const indicators: IndicatorValues = {
            daily: { ...dailyIndicators, pair },
            fourHour: { ...fourHourIndicators, pair },
            weekly: { ...weeklyIndicators, pair }
        };
        
        console.log('🎯 Calculating Smart D-Score...');
        const finalResult = calculateSmartDScore(indicators, currentPriceData);
        
        console.log(`✅ Final result for ${pair}:`, {
            price: finalResult.price,
            change: finalResult.change,
            changePercent: finalResult.changesPercentage,
            dScore: finalResult.dScore,
            grade: finalResult.grade,
            signal: finalResult.signal
        });
        
        return finalResult;

    } catch (error) {
        console.error(`❌ Failed to process data for ${pair}:`, error);
        return defaultScore;
    }
}

// Helper function to test individual pairs
export async function testForexPair(pair: string): Promise<void> {
    console.log(`\n🧪 Testing ${pair}...`);
    const result = await getForexData(pair);
    console.log('Result:', result);
}