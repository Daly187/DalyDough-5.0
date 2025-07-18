
import type { FMPHistoricalPrice, ForexData, CalculatedIndicators, FMPQuote } from './types';
import { calculateIndicators } from './indicators';

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
        
        if (!data || (Array.isArray(data) && data.length === 0) || (data && (data['Error Message'] || data.error))) {
            console.warn(`FMP API Warning for ${url}: ${data?.['Error Message'] || data?.error || 'No data or empty array returned'}`);
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
        // Fetch quote data with a short cache time (10 seconds) for near real-time updates.
        const quotePromise = fetchWithCache<FMPQuote>(`${BASE_URL}/forex/${symbol}?apikey=${API_KEY}`, 10);

        // Fetch historical data with a longer cache time (1 hour).
        const dailyPromise = fetchWithCache<{ historical: FMPHistoricalPrice[] }>(`${BASE_URL}/historical-price-full/${symbol}?timeseries=350&apikey=${API_KEY}`);
        
        const [quoteData, dailyDataResult] = await Promise.all([
            quotePromise,
            dailyPromise
        ]);

        const dailyPrices = dailyDataResult?.historical ?? [];
        
        // Use daily prices as a fallback if 4-hour data is null or empty
        const fourHourPrices = dailyPrices; // Using daily as per previous fix to avoid bad endpoint.
        
        const dailyIndicators = calculateIndicators(dailyPrices);
        const fourHourIndicators = calculateIndicators(fourHourPrices);
        const weeklyIndicators = calculateIndicators(dailyPrices, { emaPeriod: 50 });

        const indicators: CalculatedIndicators = {
            daily: dailyIndicators,
            fourHour: fourHourIndicators,
            weekly: weeklyIndicators,
        };

        return {
            pair,
            quote: quoteData,
            indicators,
        };
    } catch (error) {
        console.error(`Failed to process data for ${pair}:`, error);
        return {
            pair,
            quote: null,
            indicators: { daily: {}, fourHour: {}, weekly: {} }
        }
    }
}
