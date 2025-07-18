
import type { FMPHistoricalPrice, IndicatorSet } from '../types';
import { calculateEMA } from './ema';
import { calculateADX } from './adx';
import { calculateMACD } from './macd';
import { calculateATR } from './atr';
import { calculateStochastic } from './stochastic';
import { calculatePSAR } from './psar';
import { calculateCCI } from './cci';

// Helper function to prepare price data for the library
const preparePriceData = (prices: FMPHistoricalPrice[]) => {
    // technicalindicators expects oldest-to-newest, but FMP provides newest-to-oldest.
    const reversed = [...prices].reverse(); 
    return {
        open: reversed.map(p => p.open),
        high: reversed.map(p => p.high),
        low: reversed.map(p => p.low),
        close: reversed.map(p => p.close),
        volume: reversed.map(p => p.volume),
    };
};

export function calculateIndicators(prices: FMPHistoricalPrice[]): IndicatorSet {
    if (prices.length < 100) { // Check for minimum length for EMA100
        return {};
    }

    const input = preparePriceData(prices);
    const last = (arr: any[] | undefined) => arr?.[arr.length - 1];

    try {
        return {
            price: last(input.close),
            ema20: calculateEMA(input.close, 20),
            ema50: calculateEMA(input.close, 50),
            ema100: calculateEMA(input.close, 100),
            adx: calculateADX(input),
            macd: calculateMACD(input.close),
            atr: calculateATR(input),
            stochastic: calculateStochastic(input),
            sar: calculatePSAR(input),
            cci: calculateCCI(input),
        };
    } catch (error) {
        console.error("Error calculating indicators:", error);
        return {};
    }
}
