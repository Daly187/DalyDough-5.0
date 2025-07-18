
import { PSAR } from 'technicalindicators';
import type { StockData } from 'technicalindicators/declarations/StockData';

export function calculatePSAR(input: StockData): number | undefined {
    if (input.high.length < 2) return undefined;
    const result = PSAR.calculate({ high: input.high, low: input.low, step: 0.02, max: 0.2 });
    return result[result.length - 1];
}
