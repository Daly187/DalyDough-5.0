
import type { FMPHistoricalPrice, IndicatorSet } from '../types';
import { calculateEMA } from './ema';
import { calculateADX } from './adx';
import { calculateRSI } from './rsi';
import { calculateMACD } from './macd';
import { calculateATR } from './atr';
import { calculateBB } from './bb';
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
    if (prices.length < 50) { // Check for minimum length for EMA50
        return {};
    }

    const input = preparePriceData(prices);
    const last = (arr: any[] | undefined) => arr?.[arr.length - 1];

    try {
        return {
            price: last(input.close),
            ema50: calculateEMA(input.close, 50),
            adx: calculateADX(input),
            rsi: calculateRSI(input.close),
            macd: calculateMACD(input.close),
            atr: calculateATR(input),
            bb: calculateBB(input.close),
            stochastic: calculateStochastic(input),
            sar: calculatePSAR(input),
            cci: calculateCCI(input),
        };
    } catch (error) {
        console.error("Error calculating indicators:", error);
        return {};
    }
}
