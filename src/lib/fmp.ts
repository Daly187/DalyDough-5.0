

import type { ForexData, FMPHistoricalPrice } from './types';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY || 'RUTyEslPzCs5tHMBZUUxCr2no36EV45Q';

async function fetchWithCache<T>(url: string, ttl: number = 300): Promise<T | null> {
    try {
        const res = await fetch(url, { next: { revalidate: ttl } });
        if (!res.ok) {
            console.error(`Failed to fetch ${url}: ${res.statusText}`);
            return null;
        }
        const data = await res.json();
        // FMP returns an empty array for invalid symbols/data, not an error
        if (Array.isArray(data) && data.length === 0) {
            // console.warn(`Empty array returned from ${url}`);
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
    
    // Some APIs use a different symbol for Gold
    const apiSymbol = symbol === 'XAUUSD' ? symbol : symbol;
    
    const quotePromise = fetchWithCache<any[]>(`${BASE_URL}/quote/${apiSymbol}?apikey=${API_KEY}`);
    
    // Daily indicators
    const adxPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=14&type=adx&apikey=${API_KEY}`);
    const atrPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=14&type=atr&apikey=${API_KEY}`);
    const bbPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=20&standardDeviation=2&type=bb&apikey=${API_KEY}`);
    const sma50Promise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=50&type=sma&apikey=${API_KEY}`);
    const sma100Promise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=100&type=sma&apikey=${API_KEY}`);
    const sma200Promise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${apiSymbol}?period=200&type=sma&apikey=${API_KEY}`);

    // Weekly indicators
    const sma50WeeklyPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/weekly/${apiSymbol}?period=50&type=sma&apikey=${API_KEY}`);
    const adxWeeklyPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/weekly/${apiSymbol}?period=14&type=adx&apikey=${API_KEY}`);


    // Historical data
    const historicalPromise = fetchWithCache<{ historical: FMPHistoricalPrice[] }>(`${BASE_URL}/historical-price-full/${apiSymbol}?timeseries=21&apikey=${API_KEY}`);


    const [quote, adx, atr, bb, sma50, sma100, sma200, sma50_weekly, adx_weekly, historicalData] = await Promise.all([
        quotePromise, 
        adxPromise, 
        atrPromise,
        bbPromise,
        sma50Promise,
        sma100Promise,
        sma200Promise,
        sma50WeeklyPromise,
        adxWeeklyPromise,
        historicalPromise
    ]);
    
    return {
        pair,
        quote,
        adx,
        atr,
        bb,
        sma50,
        sma100,
        sma200,
        sma50_weekly,
        adx_weekly,
        historical: historicalData?.historical || null,
    };
}
