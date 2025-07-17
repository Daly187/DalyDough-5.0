
import type { ForexData } from './types';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

async function fetchWithCache<T>(url: string, ttl: number = 300): Promise<T | null> {
    try {
        const res = await fetch(url, { next: { revalidate: ttl } });
        if (!res.ok) {
            console.error(`Failed to fetch ${url}: ${res.statusText}`);
            return null;
        }
        const data = await res.json();
        // FMP returns an empty array for some symbols/indicators, which is valid but we treat as null
        if (Array.isArray(data) && data.length === 0) {
            return null;
        }
        return data as T;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
    }
}

export async function getForexData(pairs: string[]): Promise<ForexData[]> {
    const promises = pairs.map(async (pair) => {
        const symbol = pair.replace('/', '');
        
        // FMP uses 'XAUUSD' for Gold
        const apiSymbol = symbol === 'XAUUSD' ? symbol : symbol;
        
        const quotePromise = fetchWithCache<any[]>(`${BASE_URL}/quote/${apiSymbol}?apikey=${API_KEY}`);
        
        // Daily indicators
        const adxPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=14&type=adx&apikey=${API_KEY}`);
        const atrPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=14&type=atr&apikey=${API_KEY}`);
        const sma50Promise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=50&type=sma&apikey=${API_KEY}`);
        const sma100Promise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=100&type=sma&apikey=${API_KEY}`);
        const sma200Promise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=200&type=sma&apikey=${API_KEY}`);

        // Weekly indicators
        const sma50WeeklyPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/weekly/${apiSymbol}?period=50&type=sma&apikey=${API_KEY}`);

        const [quote, adx, atr, sma50, sma100, sma200, sma50_weekly] = await Promise.all([
            quotePromise, 
            adxPromise, 
            atrPromise,
            sma50Promise,
            sma100Promise,
            sma200Promise,
            sma50WeeklyPromise
        ]);
        
        return {
            pair,
            quote,
            adx,
            atr,
            sma50,
            sma100,
            sma200,
            sma50_weekly,
        };
    });

    return Promise.all(promises);
}
