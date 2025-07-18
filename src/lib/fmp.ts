
import type { ForexData } from './types';

const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY || 'RUTyEslPzCs5tHMBZUUxCr2no36EV45Q';

async function fetchWithCache<T>(url: string, ttl: number = 3600): Promise<T | null> {
    try {
        const res = await fetch(url, { next: { revalidate: ttl } });
        if (!res.ok) {
            console.error(`Failed to fetch ${url}: ${res.statusText}`);
            const errorText = await res.text();
            console.error(`FMP API Error for ${url}: ${errorText}`);
            return null;
        }
        const data = await res.json();
        
        if (data && (data['Error Message'] || data.error)) {
            console.warn(`FMP API Error for ${url}: ${data['Error Message'] || data.error}`);
            return null;
        }
        
        if (Array.isArray(data) && data.length === 0) {
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
    
    // Use interval=1hour for all intraday technical indicators
    const interval = "1hour";

    const quotePromise = fetchWithCache<any[]>(`${BASE_URL}/forex/${symbol}?apikey=${API_KEY}`);
    const historicalPromise = fetchWithCache<any>(`${BASE_URL}/historical-price-full/${symbol}?timeseries=21&apikey=${API_KEY}`);

    // Intraday Technical Indicators
    const ema50_4hPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/intraday/${symbol}?interval=${interval}&period=50&type=ema&apikey=${API_KEY}`);
    const ema50dPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/daily/${symbol}?period=50&type=ema&apikey=${API_KEY}`);
    const ema50_wPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/weekly/${symbol}?period=50&type=ema&apikey=${API_KEY}`);

    const adxPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/intraday/${symbol}?interval=${interval}&period=14&type=adx&apikey=${API_KEY}`);
    const rsiPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/intraday/${symbol}?interval=${interval}&period=14&type=rsi&apikey=${API_KEY}`);
    const macdPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/intraday/${symbol}?interval=${interval}&fastPeriod=12&slowPeriod=26&signalPeriod=9&type=macd&apikey=${API_KEY}`);
    const atrPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/intraday/${symbol}?interval=${interval}&period=14&type=averageTrueRange&apikey=${API_KEY}`);
    const bbPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/intraday/${symbol}?interval=${interval}&period=20&standardDeviation=2&type=bollingerBands&apikey=${API_KEY}`);
    const stochasticPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/intraday/${symbol}?interval=${interval}&period=14&kPeriod=3&dPeriod=3&type=stochastic&apikey=${API_KEY}`);
    const sarPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/intraday/${symbol}?interval=${interval}&acceleration=0.02&maximum=0.2&type=parabolicsar&apikey=${API_KEY}`);
    const cciPromise = fetchWithCache<any[]>(`${BASE_URL}/technical_indicator/intraday/${symbol}?interval=${interval}&period=20&type=cci&apikey=${API_KEY}`);

    const [
        quote, historicalData,
        ema50_4h, ema50d, ema50_w,
        adx, rsi, macd, atr, bb, stochastic, sar, cci
    ] = await Promise.all([
        quotePromise, historicalPromise,
        ema50_4hPromise, ema50dPromise, ema50_wPromise,
        adxPromise, rsiPromise, macdPromise, atrPromise, bbPromise, stochasticPromise, sarPromise, cciPromise
    ]);

    // The historical data from historical-price-full is nested under a 'historical' property
    const historical = historicalData ? historicalData.historical : null;
    
    return {
        pair,
        quote,
        historical,
        ema50d,
        adx,
        rsi,
        macd,
        atr,
        bb,
        stochastic,
        sar,
        cci,
        ema50_4h,
        ema50_w,
    };
}
