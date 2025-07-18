
import { MACD } from 'technicalindicators';

type MacdOutput = { macd?: number; signal?: number; histogram?: number };

export function calculateMACD(values: number[]): MacdOutput | undefined {
    if (values.length < 26) return undefined; // MACD needs slowPeriod
    const result = MACD.calculate({
        values,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    });
    const lastResult = result[result.length - 1];
    if (!lastResult) return undefined;
    return { macd: lastResult.MACD, signal: lastResult.signal, histogram: lastResult.histogram };
}
