'use server';
/**
 * @fileOverview An AI agent that summarizes the current market regime for a given currency pair.
 *
 * - summarizeMarketRegime - A function that summarizes the market regime.
 * - MarketRegimeSummaryInput - The input type for the summarizeMarketRegime function.
 * - MarketRegimeSummaryOutput - The return type for the summarizeMarketRegime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketRegimeSummaryInputSchema = z.object({
  currencyPair: z.string().describe('The currency pair to analyze (e.g., EURUSD).'),
  price: z.number().describe('The current price of the currency pair.'),
  volatility: z.number().describe('The current volatility of the currency pair.'),
  adx: z.number().describe('The Average Directional Index (ADX) value for the currency pair.'),
  atr: z.number().describe('The Average True Range (ATR) value for the currency pair.'),
  bollingerWidth: z.number().describe('The Bollinger Band width for the currency pair.'),
  maSlopes: z.string().describe('The moving average slopes for different timeframes for the currency pair.'),
});
export type MarketRegimeSummaryInput = z.infer<typeof MarketRegimeSummaryInputSchema>;

const MarketRegimeSummaryOutputSchema = z.object({
  regime: z.enum(['Trending', 'Ranging', 'Volatile', 'Dead']).describe('The current market regime.'),
  summary: z.string().describe('A short summary of the current market regime for the currency pair.'),
});
export type MarketRegimeSummaryOutput = z.infer<typeof MarketRegimeSummaryOutputSchema>;

export async function summarizeMarketRegime(input: MarketRegimeSummaryInput): Promise<MarketRegimeSummaryOutput> {
  return summarizeMarketRegimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketRegimeSummaryPrompt',
  input: {schema: MarketRegimeSummaryInputSchema},
  output: {schema: MarketRegimeSummaryOutputSchema},
  prompt: `You are an expert financial analyst specializing in identifying market regimes for currency pairs.

  Based on the provided market data, classify the current market regime as one of the following: Trending, Ranging, Volatile, or Dead.
  Then, provide a short summary of the market regime for the given currency pair.

  Currency Pair: {{{currencyPair}}}
  Price: {{{price}}}
  Volatility: {{{volatility}}}
  ADX: {{{adx}}}
  ATR: {{{atr}}}
  Bollinger Band Width: {{{bollingerWidth}}}
  Moving Average Slopes: {{{maSlopes}}}

  Regime: 
  Summary:`, // The schema descriptions will guide the output
});

const summarizeMarketRegimeFlow = ai.defineFlow(
  {
    name: 'summarizeMarketRegimeFlow',
    inputSchema: MarketRegimeSummaryInputSchema,
    outputSchema: MarketRegimeSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
