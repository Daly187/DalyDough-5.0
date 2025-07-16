
import type { ForexData } from './types';

// When running on the server, we can call the API directly.
// On the client, we use the proxy to avoid CORS and hide the key.
const IS_SERVER = typeof window === 'undefined';
const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = IS_SERVER 
    ? `https://financialmodelingprep.com/api/v3`
    : '/api/fmp';

async function fetchWithCache<T>(url: string, ttl: number = 300): Promise<T | null> {
    // Append API key for direct server-side calls if not using proxy.
    // Correctly use '&' if query parameters already exist.
    let finalUrl = url;
    if (IS_SERVER) {
        if (url.includes('?')) {
            finalUrl = `${url}&apikey=${FMP_API_KEY}`;
        } else {
            finalUrl = `${url}?apikey=${FMP_API_KEY}`;
        }
    }


    try {
        const res = await fetch(finalUrl, { 
            // Disable cache to ensure fresh data is fetched every time.
            cache: 'no-store',
        });

        if (!res.ok) {
            console.error(`Failed to fetch ${finalUrl}: HTTP ${res.status} ${res.statusText}`);
            const errorBody = await res.text();
            console.error('Error body:', errorBody);
            return null;
        }

        const data = await res.json();
        
        if (data && (data['Error Message'] || data.error)) {
            console.error(`API Error for ${finalUrl}: ${data['Error Message'] || data.error}`);
            return null;
        }

        if (Array.isArray(data) && data.length === 0) {
            // This can be an expected empty response for some indicators, not necessarily an error.
            return data as T;
        }

        return data as T;
    } catch (error) {
        console.error(`Network or JSON parsing error fetching ${finalUrl}:`, error);
        return null;
    }
}

export async function getForexData(pairs: string[]): Promise<ForexData[]> {
    const promises = pairs.map(async (pair) => {
        const apiSymbol = pair.replace('/', '');
        
        // Construct URLs without the API key; it's added in fetchWithCache for server-side calls
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

    // Filter out any pairs that had a complete failure to fetch essential data.
    return results.filter(result => result.quote);
}
