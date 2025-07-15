
import type { ForexData } from './types';

// Use a relative path for the proxied API route
const BASE_URL = '/api/fmp';

async function fetchWithCache<T>(url: string, ttl: number = 300): Promise<T | null> {
    try {
        const res = await fetch(url, { next: { revalidate: ttl } });
        if (!res.ok) {
            console.error(`Failed to fetch ${url}: HTTP ${res.status} ${res.statusText}`);
            const errorBody = await res.text();
            console.error('Error body:', errorBody);
            return null;
        }
        const data = await res.json();
        // The free FMP plan sometimes returns an error object with a success response code
        if (data && data['Error Message']) {
            console.error(`API Error for ${url}: ${data['Error Message']}`);
            return null;
        }
        // Also handle cases where FMP returns an empty array for a valid request
        if (Array.isArray(data) && data.length === 0) {
            // This is a valid response, but contains no data. Log it for info but don't treat as an error.
            console.warn(`Received empty array for ${url}`);
            return null; 
        }
        return data as T;
    } catch (error) {
        console.error(`Network or JSON parsing error fetching ${url}:`, error);
        return null;
    }
}

export async function getForexData(pairs: string[]): Promise<ForexData[]> {
    const promises = pairs.map(async (pair) => {
        const symbol = pair.replace('/', '');
        const apiSymbol = symbol === 'XAUUSD' ? symbol : symbol;
        
        const quotePromise = fetchWithCache(`${BASE_URL}/quote/${apiSymbol}`);
        const adxPromise = fetchWithCache(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=14&type=adx`);
        const atrPromise = fetchWithCache(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=14&type=atr`);
        const sma50Promise = fetchWithCache(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=50&type=sma`);
        const sma100Promise = fetchWithCache(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=100&type=sma`);
        const sma200Promise = fetchWithCache(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=200&type=sma`);

        const [quote, adx, atr, sma50, sma100, sma200] = await Promise.all([
            quotePromise, 
            adxPromise, 
            atrPromise,
            sma50Promise,
            sma100Promise,
            sma200Promise
        ]);
        
        // Return the object with potentially null fields. The calculation function will handle this.
        return {
            pair,
            quote,
            adx,
            atr,
            sma50,
            sma100,
            sma200
        };
    });

    const results = await Promise.all(promises);
    // The filtering will happen in the component that uses the data, based on what's available.
    return results;
}
