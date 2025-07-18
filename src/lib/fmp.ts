import type { FMPHistoricalPrice, ForexData, CalculatedIndicators, FMPQuote, DScore } from './types';
import { calculateIndicators } from './indicators';
import { calculateDScore } from './data';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY || 'RUTyEslPzCs5tHMBZUUxCr2no36EV45Q';

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

    // Get the most recent 'period' prices
    const recentPrices = prices.slice(-period);
    
    // Calculate Simple Moving Average (SMA)
    const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    
    // Calculate Standard Deviation
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    // Prevent division by zero
    if (stdDev === 0) {
        console.warn('Standard deviation is 0 for Bollinger Bands');
        return 0.5;
    }
    
    // Calculate Bollinger Bands
    const upperBand = sma + (stdDevMultiplier * stdDev);
    const lowerBand = sma - (stdDevMultiplier * stdDev);
    
    // Calculate current price position within the bands
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
    
    return Math.max(0, Math.min(1, position)); // Clamp between 0 and 1
}

// Enhanced calculateIndicators function with fixed Bollinger Bands
function calculateIndicatorsEnhanced(historicalData: FMPHistoricalPrice[], options: any = {}) {
    try {
        // Extract closing prices and validate
        const closePrices = historicalData
            .map(d => d.close)
            .filter(price => price && price > 0);
        
        if (closePrices.length < 50) {
            console.warn(`Insufficient valid price data: ${closePrices.length}`);
            return {};
        }

        console.log(`Calculating indicators with ${closePrices.length} data points`);
        console.log(`Price range: ${Math.min(...closePrices).toFixed(6)} - ${Math.max(...closePrices).toFixed(6)}`);

        // Call your original calculateIndicators function
        const indicators = calculateIndicators(historicalData, options);
        
        // Override the Bollinger Bands calculation with our fixed version
        const bollingerBands = calculateBollingerBands(closePrices, options.bbPeriod || 20, options.bbStdDev || 2);
        
        return {
            ...indicators,
            bollingerBands
        };
    } catch (error) {
        console.error('Error calculating indicators:', error);
        return {};
    }
}

// Separate function to get current price data
async function getCurrentForexPrice(symbol: string): Promise<FMPQuote | null> {
    // Try multiple endpoints for current forex data
    const endpoints = [
        `${BASE_URL}/fx/${symbol}?apikey=${API_KEY}`,
        `${BASE_URL}/quote/${symbol}?apikey=${API_KEY}`,
        `${BASE_URL}/forex/${symbol}?apikey=${API_KEY}`,
        // Try with different symbol formats
        `${BASE_URL}/fx/${symbol}=X?apikey=${API_KEY}`,
        `${BASE_URL}/quote/${symbol}=X?apikey=${API_KEY}`
    ];

    for (const endpoint of endpoints) {
        console.log(`Trying current price endpoint: ${endpoint}`);
        const data = await fetchWithCache<FMPQuote[]>(endpoint, 60); // 1 minute cache for current data
        
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
    // Try multiple endpoints for historical data
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
            // Handle different response formats
            let historicalData: FMPHistoricalPrice[];
            
            if (Array.isArray(data)) {
                historicalData = data;
            } else if (data.historical && Array.isArray(data.historical)) {
                historicalData = data.historical;
            } else {
                console.log(`Unexpected data format from ${endpoint}:`, Object.keys(data));
                continue;
            }
            
            // Validate data quality
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
    // Convert pair format and try different symbol formats
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

    // Try each symbol format until we get valid data
    for (const symbol of symbols) {
        console.log(`\n--- Trying symbol: ${symbol} ---`);
        
        // Step 1: Get current price data
        if (!currentPriceData) {
            console.log('Step 1: Fetching current price data...');
            currentPriceData = await getCurrentForexPrice(symbol);
        }
        
        // Step 2: Get historical data
        if (!historicalData) {
            console.log('Step 2: Fetching historical data...');
            historicalData = await getHistoricalForexData(symbol);
        }
        
        // If we got both, break
        if (currentPriceData && historicalData) {
            console.log(`✅ Successfully got both current and historical data for ${symbol}`);
            break;
        }
    }

    try {
        // Use fallback current price from historical data if needed
        if (!currentPriceData && historicalData && historicalData.length > 0) {
            console.log('📊 Using latest historical price as current price fallback');
            const latestData = historicalData[0]; // Usually sorted newest first
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
        
        // Calculate indicators with proper parameters and fixed Bollinger Bands
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
        
        // Use same data for different timeframes (enhance later with actual 4H and weekly data)
        const fourHourIndicators = calculateIndicatorsEnhanced(historicalData);
        const weeklyIndicators = calculateIndicatorsEnhanced(historicalData, { emaPeriod: 50 });

        const indicators: CalculatedIndicators = {
            daily: dailyIndicators,
            fourHour: fourHourIndicators,
            weekly: weeklyIndicators,
        };

        const forexData: ForexData = {
            pair,
            indicators,
        };
        
        console.log('🎯 Calculating D-Score...');
        const dScoreResult = await calculateDScore(forexData, currentPriceData);
        
        // Merge current price data with calculated indicators
        const finalResult: DScore = {
            ...dScoreResult,
            price: currentPriceData?.price || dScoreResult.price,
            change: currentPriceData?.change || dScoreResult.change,
            changesPercentage: currentPriceData?.changesPercentage || dScoreResult.changesPercentage,
            lastUpdated: Date.now()
        };
        
        console.log(`✅ Final result for ${pair}:`, {
            price: finalResult.price,
            change: finalResult.change,
            changePercent: finalResult.changesPercentage,
            dScore: finalResult.dScore,
            grade: finalResult.grade,
            signal: finalResult.signal,
            bollingerBands: finalResult.bollingerBands
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