
import { BollingerBands } from 'technicalindicators';

type BBOutput = { upper: number; middle: number; lower: number };

export function calculateBB(values: number[]): BBOutput | undefined {
    if (values.length < 20) return undefined;
    const result = BollingerBands.calculate({ period: 20, values, stdDev: 2 });
    return result[result.length - 1];
}
