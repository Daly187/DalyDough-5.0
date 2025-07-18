
import type { FMPHistoricalPrice, ForexData, CalculatedIndicators, FMPQuote, DScore } from './types';
import { calculateIndicators } from './indicators';
import { calculateDScore } from './data';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY || 'RUTyEslPzCs5tHMBZUUxCr2no36EV45Q';

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

export async function getForexData(pair: string): Promise<DScore> {
    const symbol = pair.replace('/', '');
    
    const defaultScore: DScore = {
        id: pair, pair: pair, price: 0, change: 0, changesPercentage: 0, dScore: 0, grade: 'C',
        signal: 'Block', positions: 0, lastUpdated: 0,
        trendAlignment: 0, adxStrength: 0, rsiMomentum: 0, macdMomentum: 0,
        atrVolatility: 0, bollingerBands: 0, stochasticOscillator: 0, parabolicSAR: 0, cci: 0, obv: 0,
    };

    try {
        const quotePromise = fetchWithCache<FMPQuote[]>(`${BASE_URL}/forex/${symbol}?apikey=${API_KEY}`, 10);
        const dailyPromise = fetchWithCache<{ historical: FMPHistoricalPrice[] }>(`${BASE_URL}/historical-price-full/${symbol}?timeseries=350&apikey=${API_KEY}`);
        
        const [quoteData, dailyDataResult] = await Promise.all([
            quotePromise,
            dailyPromise
        ]);

        if (!dailyDataResult || !dailyDataResult.historical || dailyDataResult.historical.length === 0) {
            console.warn(`No historical data for ${pair}, returning default score.`);
            return defaultScore;
        }
        
        const dailyPrices = dailyDataResult.historical;
        const fourHourPrices = dailyPrices;
        
        const dailyIndicators = calculateIndicators(dailyPrices);
        const fourHourIndicators = calculateIndicators(fourHourPrices);
        const weeklyIndicators = calculateIndicators(dailyPrices, { emaPeriod: 50 });

        const indicators: CalculatedIndicators = {
            daily: dailyIndicators,
            fourHour: fourHourIndicators,
            weekly: weeklyIndicators,
        };

        const forexData: ForexData = {
            pair,
            indicators,
        };
        
        const singleQuote = quoteData?.[0] ?? null;

        const dScoreData = await calculateDScore(forexData, singleQuote);

        return dScoreData;

    } catch (error) {
        console.error(`Failed to process data for ${pair}:`, error);
        return defaultScore;
    }
}
