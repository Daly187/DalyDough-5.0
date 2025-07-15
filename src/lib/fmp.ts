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
        return await res.json() as T;
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
        
        const quotePromise = fetchWithCache(`${BASE_URL}/quote/${apiSymbol}?apikey=${API_KEY}`);
        const adxPromise = fetchWithCache(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=14&type=adx&apikey=${API_KEY}`);
        const atrPromise = fetchWithCache(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=14&type=atr&apikey=${API_KEY}`);
        const sma50Promise = fetchWithCache(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=50&type=sma&apikey=${API_KEY}`);
        const sma100Promise = fetchWithCache(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=100&type=sma&apikey=${API_KEY}`);
        const sma200Promise = fetchWithCache(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=200&type=sma&apikey=${API_KEY}`);

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

    return Promise.all(promises);
}
