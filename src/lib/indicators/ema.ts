
import { EMA } from 'technicalindicators';

export function calculateEMA(values: number[], period: number): number | undefined {
    if (values.length < period) return undefined;
    const result = EMA.calculate({ period, values });
    return result[result.length - 1];
}
