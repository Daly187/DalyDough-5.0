
import { Stochastic } from 'technicalindicators';
import type { StockData } from 'technicalindicators/declarations/StockData';

type StochasticOutput = { k: number; d: number };

export function calculateStochastic(input: StockData): StochasticOutput | undefined {
    if (input.close.length < 14) return undefined;
    const result = Stochastic.calculate({
        ...input,
        period: 14,
        signalPeriod: 3,
    });
    return result[result.length - 1];
}
