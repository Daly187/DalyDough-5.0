
import type { ForexData } from './types';

const FMP_API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

async function fetchWithCache<T>(url: string): Promise<T | null> {
    if (!FMP_API_KEY || FMP_API_KEY === 'YOUR_FMP_API_KEY') {
        console.error("FMP API key is not configured in .env file. Please add FMP_API_KEY.");
        return null;
    }

    const finalUrl = `${url}${url.includes('?') ? '&' : '?'}apikey=${FMP_API_KEY}`;

    try {
        const res = await fetch(finalUrl, { 
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

        return data as T;
    } catch (error) {
        console.error(`Network or JSON parsing error fetching ${finalUrl}:`, error);
        return null;
    }
}

export async function getForexData(pairs: string[]): Promise<ForexData[]> {
    const promises = pairs.map(async (pair) => {
        const apiSymbol = pair.replace('/', '');
        
        const quotePromise = fetchWithCache<any>(`${BASE_URL}/quote/${apiSymbol}`);
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
    return results.filter(result => result.quote && result.quote.length > 0);
}
