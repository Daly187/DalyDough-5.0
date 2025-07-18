
import type { FMPHistoricalPrice, ForexData, CalculatedIndicators, FMPQuote } from './types';
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

export async function getForexData(pair: string): Promise<ForexData> {
    const symbol = pair.replace('/', '');

    try {
        const quotePromise = fetchWithCache<FMPQuote[]>(`${BASE_URL}/forex/${symbol}?apikey=${API_KEY}`, 10);
        const dailyPromise = fetchWithCache<{ historical: FMPHistoricalPrice[] }>(`${BASE_URL}/historical-price-full/${symbol}?timeseries=350&apikey=${API_KEY}`);
        
        const [quoteData, dailyDataResult] = await Promise.all([
            quotePromise,
            dailyPromise
        ]);
        
        const dailyPrices = dailyDataResult?.historical || [];

        // Use daily prices for all timeframes as a robust solution
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

        // Directly call calculateDScore here, passing the quote data explicitly.
        const dScoreData = await calculateDScore(forexData, singleQuote);

        // The DScore object now contains everything, so we cast it.
        // This is a bit of a trick, but it fits the existing structure.
        return dScoreData as ForexData;

    } catch (error) {
        console.error(`Failed to process data for ${pair}:`, error);
        // This return structure might need to be DScore compatible
        return {
            pair,
            indicators: { daily: {}, fourHour: {}, weekly: {} }
        } as ForexData;
    }
}
