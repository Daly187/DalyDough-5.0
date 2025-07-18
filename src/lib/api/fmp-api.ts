
import type { FMPQuote, FMPHistoricalPrice } from '../types';

const API_KEY = process.env.FMP_API_KEY || "RUTyEslPzCs5tHMBZUUxCr2no36EV45Q";
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

// A simple in-memory cache to avoid redundant API calls during the same session
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000 * 5; // 5 minutes

async function fetchWithCache<T>(endpoint: string): Promise<T | null> {
    const now = Date.now();
    const cachedItem = cache.get(endpoint);

    if (cachedItem && (now - cachedItem.timestamp < CACHE_TTL_MS)) {
        return cachedItem.data as T;
    }

    try {
        const response = await fetch(`${BASE_URL}/${endpoint}?apikey=${API_KEY}`);
        if (!response.ok) {
            console.error(`API Error for ${endpoint}: ${response.statusText}`);
            return null;
        }
        const data = await response.json();

        // Handle cases where FMP returns an empty object for a bad symbol
        if (typeof data === 'object' && data !== null && !Array.isArray(data) && Object.keys(data).length === 0) {
            console.warn(`Received empty object for endpoint: ${endpoint}`);
            return null;
        }

        // FMP sometimes returns a single object instead of an array of one
        const formattedData = (Array.isArray(data) || data === null) ? data : [data];

        cache.set(endpoint, { data: formattedData, timestamp: now });
        return formattedData as T;
    } catch (error) {
        console.error(`Network or parsing error for ${endpoint}:`, error);
        return null;
    }
}

export function fetchQuote(symbol: string): Promise<FMPQuote[] | null> {
    return fetchWithCache<FMPQuote[]>(`quote/${symbol}`);
}

export function fetchHistorical(symbol: string, limit: number): Promise<FMPHistoricalPrice[] | null> {
    return fetchWithCache<FMPHistoricalPrice[]>(`historical-price-full/${symbol}?timeseries=${limit}`);
}
