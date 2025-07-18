
import { RSI } from 'technicalindicators';

export function calculateRSI(values: number[]): number | undefined {
    if (values.length < 15) return undefined; // RSI needs period + 1
    const result = RSI.calculate({ values, period: 14 });
    return result[result.length - 1];
}
