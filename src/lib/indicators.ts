
import {
    EMA, ADX, RSI, MACD, ATR,
    BollingerBands as BB, Stochastic,
    PSAR, CCI
} from 'technicalindicators';
import type { FMPHistoricalPrice, IndicatorSet } from './types';

// Helper function to prepare price data for the library
const preparePriceData = (prices: FMPHistoricalPrice[]) => {
    const reversed = [...prices].reverse(); // technicalindicators expects oldest-to-newest
    return {
        open: reversed.map(p => p.open),
        high: reversed.map(p => p.high),
        low: reversed.map(p => p.low),
        close: reversed.map(p => p.close),
        volume: reversed.map(p => p.volume),
    };
};

export function calculateIndicators(prices: FMPHistoricalPrice[]): IndicatorSet {
    if (prices.length < 50) { // Need enough data for a 50-period EMA
        return {};
    }

    const input = preparePriceData(prices);
    const last = (arr: any[] | undefined) => arr?.[arr.length - 1];

    try {
        const ema50 = last(EMA.calculate({ period: 50, values: input.close }));
        const adx = last(ADX.calculate({ high: input.high, low: input.low, close: input.close, period: 14 }))?.adx;
        const rsi = last(RSI.calculate({ values: input.close, period: 14 }));
        
        const macdResult = MACD.calculate({
            values: input.close,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        });
        const macdItem = last(macdResult);
        const macd = macdItem ? { macd: macdItem.MACD, signal: macdItem.signal, histogram: macdItem.histogram } : undefined;


        const atr = last(ATR.calculate({ high: input.high, low: input.low, close: input.close, period: 14 }));
        
        const bbResult = BB.calculate({ period: 20, values: input.close, stdDev: 2 });
        const bb = last(bbResult);

        const stochResult = Stochastic.calculate({
            high: input.high,
            low: input.low,
            close: input.close,
            period: 14,
            signalPeriod: 3,
        });
        const stochastic = last(stochResult);

        const sar = last(PSAR.calculate({ high: input.high, low: input.low, step: 0.02, max: 0.2 }));

        const cci = last(CCI.calculate({ open: input.open, high: input.high, low: input.low, close: input.close, period: 20 }));

        return {
            ema50,
            adx,
            rsi,
            macd,
            atr,
            bb,
            stochastic,
            sar,
            cci,
        };
    } catch (error) {
        console.error("Error calculating indicators:", error);
        return {};
    }
}
