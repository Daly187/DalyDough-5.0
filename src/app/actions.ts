"use server";

import { dScoreExplanation, DScoreExplanationInput } from "@/ai/flows/d-score-explanation";
import { summarizeMarketRegime, MarketRegimeSummaryInput } from "@/ai/flows/market-regime-summary";

export async function getDScoreExplanation(input: DScoreExplanationInput) {
  try {
    const result = await dScoreExplanation(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getDScoreExplanation:", error);
    return { success: false, error: "Failed to generate explanation." };
  }
}

export async function getMarketRegimeSummary(input: MarketRegimeSummaryInput) {
    try {
        const result = await summarizeMarketRegime(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error in getMarketRegimeSummary:", error);
        return { success: false, error: "Failed to generate market summary." };
    }
}
