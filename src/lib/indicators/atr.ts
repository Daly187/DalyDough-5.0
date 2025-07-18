
import { ATR } from 'technicalindicators';
import type { StockData } from 'technicalindicators/declarations/StockData';

export function calculateATR(input: StockData): number | undefined {
    if (input.close.length < 15) return undefined; // ATR needs period + 1
    const result = ATR.calculate({ ...input, period: 14 });
    return result[result.length - 1];
}
