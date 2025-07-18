import type { FMPHistoricalPrice, ForexData, CalculatedIndicators } from './types';
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
        
        if (data && (data['Error Message'] || data.error)) {
            console.warn(`FMP API Warning for ${url}: ${data['Error Message'] || data.error}`);
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

    // 1. Fetch historical data for all required timeframes
    const dailyPromise = fetchWithCache<{ historical: FMPHistoricalPrice[] }>(`${BASE_URL}/historical-price-full/${symbol}?timeseries=100&apikey=${API_KEY}`);
    const fourHourPromise = fetchWithCache<FMPHistoricalPrice[]>(`${BASE_URL}/historical-chart/4hour/${symbol}?apikey=${API_KEY}`);
    const weeklyPromise = fetchWithCache<FMPHistoricalPrice[]>(`${BASE_URL}/historical-chart/weekly/${symbol}?apikey=${API_KEY}`);
    const quotePromise = fetchWithCache<any[]>(`${BASE_URL}/forex/${symbol}?apikey=${API_KEY}`);

    const [dailyData, fourHourData, weeklyData, quoteData] = await Promise.all([
        dailyPromise,
        fourHourPromise,
        weeklyPromise,
        quotePromise
    ]);

    const dailyPrices = dailyData?.historical ?? [];
    const fourHourPrices = fourHourData ?? [];
    const weeklyPrices = weeklyData ?? [];
    
    // 2. Calculate indicators locally
    const indicators: CalculatedIndicators = {
        daily: calculateIndicators(dailyPrices),
        fourHour: calculateIndicators(fourHourPrices),
        weekly: calculateIndicators(weeklyPrices),
    };

    return {
        pair,
        quote: quoteData,
        indicators,
    };
}
