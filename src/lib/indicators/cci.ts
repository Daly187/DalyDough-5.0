
import { CCI } from 'technicalindicators';
import type { StockData } from 'technicalindicators/declarations/StockData';

export function calculateCCI(input: StockData): number | undefined {
    if (input.close.length < 20) return undefined;
    const result = CCI.calculate({ ...input, period: 20 });
    return result[result.length - 1];
}
