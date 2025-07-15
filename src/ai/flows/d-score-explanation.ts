'use server';

/**
 * @fileOverview Provides an explanation for a given D-Score.
 *
 * - dScoreExplanation - A function that generates the D-Score explanation.
 * - DScoreExplanationInput - The input type for the dScoreExplanation function.
 * - DScoreExplanationOutput - The return type for the dScoreExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DScoreExplanationInputSchema = z.object({
  currencyPair: z.string().describe('The currency pair to explain the D-Score for (e.g., EURUSD).'),
  dScore: z.number().describe('The D-Score for the currency pair.'),
  cotBias: z.number().describe('The COT Bias component of the D-Score.'),
  trendAlignment: z.number().describe('The Trend Alignment component of the D-Score.'),
  adx: z.number().describe('The ADX component of the D-Score.'),
  atrVolatility: z.number().describe('The ATR/Volatility component of the D-Score.'),
  srRetest: z.number().describe('The S/R Retest component of the D-Score.'),
  priceStructure: z.number().describe('The Price Structure component of the D-Score.'),
  spread: z.number().describe('The Spread component of the D-Score.'),
  marketRegimeFit: z.number().describe('The Market Regime Fit component of the D-Score.'),
});
export type DScoreExplanationInput = z.infer<typeof DScoreExplanationInputSchema>;

const DScoreExplanationOutputSchema = z.object({
  explanation: z.string().describe('A short summary of why the currency pair received the given D-Score, calling out specific factors and their relative contributions.'),
});
export type DScoreExplanationOutput = z.infer<typeof DScoreExplanationOutputSchema>;

export async function dScoreExplanation(input: DScoreExplanationInput): Promise<DScoreExplanationOutput> {
  return dScoreExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dScoreExplanationPrompt',
  input: {schema: DScoreExplanationInputSchema},
  output: {schema: DScoreExplanationOutputSchema},
  prompt: `You are an expert forex market analyst. Provide a concise explanation of the D-Score for the given currency pair based on the following factors and their values:

Currency Pair: {{{currencyPair}}}
D-Score: {{{dScore}}}
COT Bias: {{{cotBias}}}
Trend Alignment: {{{trendAlignment}}}
ADX: {{{adx}}}
ATR/Volatility: {{{atrVolatility}}}
S/R Retest: {{{srRetest}}}
Price Structure: {{{priceStructure}}}
Spread: {{{spread}}}
Market Regime Fit: {{{marketRegimeFit}}}

Focus on the most influential factors and their contribution to the overall score. Keep the explanation brief and easy to understand.
`,
});

const dScoreExplanationFlow = ai.defineFlow(
  {
    name: 'dScoreExplanationFlow',
    inputSchema: DScoreExplanationInputSchema,
    outputSchema: DScoreExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
