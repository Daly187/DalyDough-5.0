
import { ADX } from 'technicalindicators';
import type { StockData } from 'technicalindicators/declarations/StockData';

export function calculateADX(input: StockData): number | undefined {
    if (input.close.length < 28) return undefined; // ADX needs 2x period
    const result = ADX.calculate({ ...input, period: 14 });
    const lastResult = result[result.length - 1];
    return lastResult?.adx;
}
