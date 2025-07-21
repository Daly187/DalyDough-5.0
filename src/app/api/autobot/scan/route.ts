
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase/firestore';
import { collection, doc, getDoc, getDocs, query, where, addDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { getForexData } from '@/lib/fmp';
import type { AutoBotStrategy, Bot, PendingOrder, TradeAccount } from '@/lib/types';
import { headers } from 'next/headers';

async function getUserId() {
  const headersList = headers();
  // In a real cron job, you might pass a user ID in the request body or as a query param.
  // For manual scans from the UI, we get it from the header.
  const userId = headersList.get('x-user-id');
  if (!userId) {
    // This allows unauthenticated cron jobs to work, but they must specify a UID in the body.
    console.warn("x-user-id header not found. This is expected for cron jobs.");
    return null; 
  }
  return userId;
}

async function getStrategy(userId: string): Promise<AutoBotStrategy | null> {
    const strategyRef = doc(db, 'autobotStrategies', userId);
    const strategySnap = await getDoc(strategyRef);
    if (!strategySnap.exists()) return null;
    return { id: strategySnap.id, ...strategySnap.data() } as AutoBotStrategy;
}

export async function POST(request: NextRequest) {
  const internalCronHeader = request.headers.get('x-internal-cron');
  const isCronJob = internalCronHeader === 'true';

  let userId: string | null = null;
  let requestBody: any = {};
  
  try {
    requestBody = await request.json().catch(() => ({})); 
  } catch (e) {
    // Ignore error if body is empty
  }

  if (isCronJob) {
    // Cron job must provide a target UID in the request body
    userId = requestBody.uid;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Cron job must specify a user ID (uid) in the request body.' }, { status: 400 });
    }
  } else {
    // Manual scan from UI, get user from headers
    userId = await getUserId();
     if (!userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized: User not specified for manual scan.' }, { status: 401 });
     }
  }

  try {
    const strategy = await getStrategy(userId);

    if (!strategy) {
      return NextResponse.json({ success: false, error: `Auto Bot strategy not configured for user ${userId}.` }, { status: 404 });
    }

    const activeBotsQuery = query(
        collection(db, "bots"), 
        where("uid", "==", userId),
        where("status", "==", "active")
    );
    const activeBotsSnap = await getDocs(activeBotsQuery);
    const activeBotPairs = new Set(activeBotsSnap.docs.map(doc => doc.data().pair));

    const includedPairs = Object.entries(strategy.includedPairs)
        .filter(([, included]) => included)
        .map(([pair]) => pair);

    const dScorePromises = includedPairs.map(pair => getForexData(pair));
    const dScores = await Promise.all(dScorePromises);

    let botsCreatedCount = 0;

    for (const dScore of dScores) {
      if (!dScore) continue;

      const isBuySignal = dScore.dScore >= strategy.entryThresholdUpper;
      const isSellSignal = dScore.dScore <= strategy.entryThresholdLower;
      const alreadyHasActiveBot = activeBotPairs.has(dScore.pair);

      if ((isBuySignal || isSellSignal) && !alreadyHasActiveBot) {
        const direction = isBuySignal ? 'Buy' : 'Sell';
        const pipSize = dScore.pair.includes('JPY') ? 0.01 : 0.0001;
        
        const pendingOrders: PendingOrder[] = [];
        let currentLotSize = Number(strategy.lotSize);
        let currentGridDistance = Number(strategy.gridDistance);
        let cumulativeDistance = 0;

        for (let i = 1; i <= strategy.gridLevels; i++) {
             if (i > 1) {
                currentLotSize *= Number(strategy.lotSizeMultiplier);
                currentGridDistance *= Number(strategy.gridDistanceMultiplier);
            }
            
            cumulativeDistance += currentGridDistance;
            const priceOffset = cumulativeDistance * pipSize;
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
            uid: userId, 
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

    return NextResponse.json({ success: true, message: `Scan complete for user ${userId}. ${botsCreatedCount} new bot(s) created.` });

  } catch (error) {
    console.error("Error during Auto Bot scan:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
