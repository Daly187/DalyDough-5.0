
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase/firestore';
import { collection, doc, getDoc, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { getForexData } from '@/lib/fmp';
import type { AutoBotStrategy, Bot, PendingOrder } from '@/lib/types';

// In a multi-user app, this ID would be derived from the authenticated user's ID.
const GLOBAL_STRATEGY_ID = 'global_strategy';

export async function POST(request: NextRequest) {
  // Simple security check: Ensure the request is coming from our Cloud Function
  const internalCronHeader = request.headers.get('x-internal-cron');
  if (process.env.NODE_ENV === 'production' && internalCronHeader !== 'true') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }


  try {
    // 1. Fetch the Auto Bot Strategy
    const strategyRef = doc(db, 'autobotStrategies', GLOBAL_STRATEGY_ID);
    const strategySnap = await getDoc(strategyRef);

    if (!strategySnap.exists()) {
      return NextResponse.json({ success: false, error: 'Auto Bot strategy not configured.' }, { status: 404 });
    }
    const strategy = strategySnap.data() as Omit<AutoBotStrategy, 'id'>;

    // 2. Fetch all active bots to avoid creating duplicates
    // We assume a single user for now. In a real app, you'd filter by UID.
    const activeBotsQuery = query(
        collection(db, "bots"), 
        where("status", "==", "active")
    );
    const activeBotsSnap = await getDocs(activeBotsQuery);
    const activeBotPairs = new Set(activeBotsSnap.docs.map(doc => doc.data().pair));

    // 3. Scan the market for all included pairs
    const includedPairs = Object.entries(strategy.includedPairs)
        .filter(([, included]) => included)
        .map(([pair]) => pair);

    const dScorePromises = includedPairs.map(pair => getForexData(pair));
    const dScores = await Promise.all(dScorePromises);

    let botsCreatedCount = 0;

    // 4. Iterate and create bots if conditions are met
    for (const dScore of dScores) {
      if (!dScore) continue;

      const isBuySignal = dScore.dScore >= strategy.entryThresholdUpper;
      const isSellSignal = dScore.dScore <= strategy.entryThresholdLower;
      const alreadyHasActiveBot = activeBotPairs.has(dScore.pair);

      if ((isBuySignal || isSellSignal) && !alreadyHasActiveBot) {
        // Create a new bot
        const direction = isBuySignal ? 'Buy' : 'Sell';
        const pipSize = dScore.pair.includes('JPY') ? 0.01 : 0.0001;
        
        const pendingOrders: PendingOrder[] = [];
        let currentLotSize = Number(strategy.lotSize);
        for (let i = 1; i <= strategy.gridLevels; i++) {
             if (i > 1) {
                currentLotSize *= Number(strategy.lotSizeMultiplier);
            }
            const priceOffset = Number(strategy.gridDistance) * pipSize * i;
            const targetPrice = direction === 'Buy' 
                ? dScore.price - priceOffset 
                : dScore.price + priceOffset;

            pendingOrders.push({
                level: i,
                targetPrice: parseFloat(targetPrice.toFixed(5)),
                lotSize: parseFloat(currentLotSize.toFixed(2)),
                status: 'PENDING'
            });
        }
        
        const newBotData: Omit<Bot, 'id'> = {
            ...strategy,
            uid: 'autobot_system', // Identify as an auto-created bot
            pair: dScore.pair,
            status: 'active',
            createdAt: serverTimestamp(),
            profit_loss: 0,
            strategy: strategy.botType || "DCA Grid",
            d_score_entry: dScore.dScore,
            direction: direction,
            pendingOrders: pendingOrders,
        };

        await addDoc(collection(db, "bots"), newBotData);
        botsCreatedCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Scan complete. ${botsCreatedCount} new bot(s) created.` });

  } catch (error) {
    console.error("Error during Auto Bot scan:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
