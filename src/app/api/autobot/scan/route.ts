'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/firebase/firestore';
import { collection, doc, getDoc, getDocs, query, where, addDoc, serverTimestamp, runTransaction, updateDoc, deleteDoc } from 'firebase/firestore';
import { getForexData } from '@/lib/fmp';
import type { AutoBotStrategy, Bot, PendingOrder, UserSettings } from '@/lib/types';
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

async function getStrategyAndSettings(userId: string): Promise<{ strategy: AutoBotStrategy | null, settings: UserSettings | null }> {
    const strategyRef = doc(db, 'autobotStrategies', userId);
    const settingsRef = doc(db, 'userSettings', userId);
    
    const [strategySnap, settingsSnap] = await Promise.all([
      getDoc(strategyRef),
      getDoc(settingsRef)
    ]);

    const strategy = strategySnap.exists() ? { id: strategySnap.id, ...strategySnap.data() } as AutoBotStrategy : null;
    const settings = settingsSnap.exists() ? settingsSnap.data() as UserSettings : null;
    
    return { strategy, settings };
}

// Helper function to close a bot and update all pending orders
async function closeBot(botId: string): Promise<void> {
  try {
    const botRef = doc(db, 'bots', botId);
    const botDoc = await getDoc(botRef);
    
    if (!botDoc.exists()) {
      throw new Error('Bot not found');
    }
    
    const botData = botDoc.data() as Bot;
    
    // Update all pending orders to closed status
    const updatedPendingOrders = botData.pendingOrders?.map(order => ({
      ...order,
      status: 'closed' as const
    })) || [];
    
    // Update the bot with closed status and closed pending orders
    await updateDoc(botRef, {
      status: 'closed',
      pendingOrders: updatedPendingOrders
    });
    
    console.log(`Bot ${botId} closed successfully with all pending orders updated.`);
    
  } catch (error) {
    console.error(`Error closing bot ${botId}:`, error);
    throw error;
  }
}

// Helper function to delete a bot completely
async function deleteBot(botId: string): Promise<void> {
  try {
    const botRef = doc(db, 'bots', botId);
    const botDoc = await getDoc(botRef);
    
    if (!botDoc.exists()) {
      throw new Error('Bot not found');
    }
    
    const botData = botDoc.data() as Bot;
    
    // If bot is still active, close it first (update pending orders)
    if (botData.status === 'active') {
      const updatedPendingOrders = botData.pendingOrders?.map(order => ({
        ...order,
        status: 'closed' as const
      })) || [];
      
      await updateDoc(botRef, {
        status: 'closed',
        pendingOrders: updatedPendingOrders
      });
    }
    
    // Now delete the bot document
    await deleteDoc(botRef);
    
    console.log(`Bot ${botId} deleted successfully.`);
    
  } catch (error) {
    console.error(`Error deleting bot ${botId}:`, error);
    throw error;
  }
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
    const { strategy, settings } = await getStrategyAndSettings(userId);

    if (!strategy) {
      return NextResponse.json({ success: false, error: `Auto Bot strategy not configured for user ${userId}.` }, { status: 404 });
    }
    
    if (!settings || !settings.symbolMappings) {
      return NextResponse.json({ success: false, error: `User symbol settings not found for user ${userId}.` }, { status: 404 });
    }

    const symbolMap = new Map(settings.symbolMappings.map(m => [m.apiSymbol, m.brokerSymbol]));

    const activeBotsQuery = query(
        collection(db, "bots"), 
        where("uid", "==", userId),
        where("status", "==", "active")
    );
    const activeBotsSnap = await getDocs(activeBotsQuery);
    const activeBotPairs = new Set(activeBotsSnap.docs.map(doc => doc.data().pair));

    const includedApiPairs = Object.entries(strategy.includedPairs)
        .filter(([, included]) => included)
        .map(([pair]) => pair);

    const dScorePromises = includedApiPairs.map(pair => getForexData(pair));
    const dScores = await Promise.all(dScorePromises);

    let botsCreatedCount = 0;

    for (const dScore of dScores) {
      if (!dScore) continue;

      const brokerSymbol = symbolMap.get(dScore.pair);
      if (!brokerSymbol) {
        console.warn(`No broker symbol found for API pair: ${dScore.pair}. Skipping.`);
        continue;
      }

      const isBuySignal = dScore.dScore >= strategy.entryThresholdUpper;
      const isSellSignal = dScore.dScore <= strategy.entryThresholdLower;
      const alreadyHasActiveBot = activeBotPairs.has(brokerSymbol);

      if ((isBuySignal || isSellSignal) && !alreadyHasActiveBot) {
        const direction = isBuySignal ? 'Buy' : 'Sell';
        const pipSize = dScore.pair.includes('JPY') ? 0.01 : 0.0001;

        const pendingOrders: PendingOrder[] = [];
        
        // Add the initial entry order (Level 1) with "active" status
        pendingOrders.push({
            level: 1,
            targetPrice: parseFloat(dScore.price.toFixed(5)), // Current market price
            lotSize: parseFloat(Number(strategy.lotSize).toFixed(2)), // Initial lot size
            status: 'active' // This should execute immediately
        });

        // Add the DCA levels (starting from Level 2) with "PENDING" status
        let currentLotSize = Number(strategy.lotSize);
        let cumulativeDistance = 0;

        for (let i = 2; i <= strategy.gridLevels; i++) {
            currentLotSize *= Number(strategy.lotSizeMultiplier);
            
            const distanceMultiplier = (strategy.gridDistanceMultiplier ?? 1.5) ** (i - 2);
            cumulativeDistance += Number(strategy.gridDistance) * distanceMultiplier;

            const priceOffset = cumulativeDistance * pipSize;
            const targetPrice = direction === 'Buy' 
                ? dScore.price - priceOffset 
                : dScore.price + priceOffset;

            pendingOrders.push({
                level: i,
                targetPrice: parseFloat(targetPrice.toFixed(5)),
                lotSize: parseFloat(currentLotSize.toFixed(2)),
                status: 'PENDING' // These wait for price to reach target levels
            });
        }
        
        console.log(`Creating auto bot for ${brokerSymbol} with pending orders:`, pendingOrders);
        
        const newBotData: Omit<Bot, 'id'> = {
            ...strategy,
            uid: userId, 
            pair: brokerSymbol, // Use the broker symbol here
            status: 'active',
            createdAt: serverTimestamp(),
            profit_loss: 0,
            strategy: strategy.botType || "Dynamic DCA",
            d_score_entry: dScore.dScore,
            direction: direction,
            pendingOrders: pendingOrders,
        };

        await addDoc(collection(db, "bots"), newBotData);
        botsCreatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Scan complete for user ${userId}. ${botsCreatedCount} new bot(s) created with initial entries.` 
    });

  } catch (error) {
    console.error("Error during Auto Bot scan:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Handle DELETE requests to close a specific bot
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('id');
    const action = searchParams.get('action'); // 'close' or 'delete'
    
    if (!botId) {
      return NextResponse.json({ success: false, error: 'Bot ID is required' }, { status: 400 });
    }
    
    if (action === 'delete') {
      await deleteBot(botId);
      return NextResponse.json({ 
        success: true, 
        message: `Bot ${botId} deleted successfully.` 
      });
    } else {
      // Default to close
      await closeBot(botId);
      return NextResponse.json({ 
        success: true, 
        message: `Bot ${botId} closed successfully.` 
      });
    }
    
  } catch (error) {
    console.error("Error handling bot deletion/closure:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// Handle PUT requests to update bot status
export async function PUT(request: NextRequest) {
  try {
    const { botId, status, pendingOrders } = await request.json();
    
    if (!botId) {
      return NextResponse.json({ success: false, error: 'Bot ID is required' }, { status: 400 });
    }
    
    const botRef = doc(db, 'bots', botId);
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // If closing the bot, also close all pending orders
      if (status === 'closed') {
        const botDoc = await getDoc(botRef);
        if (botDoc.exists()) {
          const botData = botDoc.data() as Bot;
          updateData.pendingOrders = botData.pendingOrders?.map(order => ({
            ...order,
            status: 'closed' as const
          })) || [];
        }
      }
    }
    
    if (pendingOrders) {
      updateData.pendingOrders = pendingOrders;
    }
    
    await updateDoc(botRef, updateData);
    
    return NextResponse.json({ 
      success: true, 
      message: `Bot ${botId} updated successfully.` 
    });
    
  } catch (error) {
    console.error("Error updating bot:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}