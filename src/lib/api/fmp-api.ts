
import type { FMPQuote, FMPHistoricalPrice, NewsEvent } from '../types';

const API_KEY = process.env.FMP_API_KEY || "RUTyEslPzCs5tHMBZUUxCr2no36EV45Q";
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

// A simple in-memory cache to avoid redundant API calls during the same session
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000 * 1; // 1 minute

async function fetchWithCache<T>(endpoint: string, noCache: boolean = false): Promise<T | null> {
    const now = Date.now();
    const cachedItem = cache.get(endpoint);

    if (cachedItem && (now - cachedItem.timestamp < CACHE_TTL_MS) && !noCache) {
        return cachedItem.data as T;
    }

    try {
        const response = await fetch(`${BASE_URL}/${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${API_KEY}`);
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
        
        // FMP sometimes nests forex historical data in a `historical` property.
        const responseData = data.historical || data;

        // FMP can return a single object instead of an array of one.
        const formattedData = (Array.isArray(responseData) || responseData === null) ? responseData : [responseData];

        if (!noCache) {
            cache.set(endpoint, { data: formattedData, timestamp: now });
        }
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

export function fetchEconomicCalendar(from: string, to: string): Promise<NewsEvent[] | null> {
    // We force no-cache for the calendar to ensure fresh data on refresh.
    return fetchWithCache<NewsEvent[]>(`economic_calendar?from=${from}&to=${to}`, true);
}
