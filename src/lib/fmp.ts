
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
        
        if (!data || (data && (data['Error Message'] || data.error))) {
            console.warn(`FMP API Warning for ${url}: ${data?.['Error Message'] || data?.error || 'No data returned'}`);
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
        // The daily historical data is wrapped in an array, so its type is { historical: ... }[]
        const dailyPromise = fetchWithCache<{ historical: FMPHistoricalPrice[] }[]>(`${BASE_URL}/historical-price-full/${symbol}?timeseries=350&apikey=${API_KEY}`);
        const fourHourPromise = fetchWithCache<FMPHistoricalPrice[]>(`${BASE_URL}/historical-chart/4hour/${symbol}?apikey=${API_KEY}`);
        const quotePromise = fetchWithCache<FMPQuote>(`${BASE_URL}/forex/${symbol}?apikey=${API_KEY}`);

        const [dailyDataResult, fourHourData, quoteData] = await Promise.all([
            dailyPromise,
            fourHourPromise,
            quotePromise
        ]);

        // Correctly extract the historical array from the wrapped response
        const dailyPrices = dailyDataResult?.[0]?.historical ?? [];
        const fourHourPrices = fourHourData ?? [];
        
        const dailyIndicators = calculateIndicators(dailyPrices);
        const fourHourIndicators = calculateIndicators(fourHourPrices);
        // Calculate weekly indicators from the daily price data
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
