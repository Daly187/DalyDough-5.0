
'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firestore';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import type { AutoBotStrategy } from '@/lib/types';
import { headers } from 'next/headers';

const strategyCollection = collection(db, 'autobotStrategies');

// Default symbol list for new strategies.
const DEFAULT_SYMBOLS = [
    'AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD', 'CAD/JPY', 'CHF/JPY',
    'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EURNZD', 'EUR/TRY', 'EUR/USD',
    'GBP/AUD', 'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'NZD/CAD', 'NZD/CHF',
    'NZD/JPY', 'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY', 'USD/TRY', 'USD/ZAR', 'XAU/USD'
];


async function getUserId() {
  const headersList = headers();
  const userId = headersList.get('x-user-id');
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
}

export async function GET() {
  try {
    const userId = await getUserId();
    const docRef = doc(strategyCollection, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
    } else {
      // Create a default strategy if one doesn't exist for the user
      const defaultStrategy: Omit<AutoBotStrategy, 'id'> = {
        entryThresholdUpper: 7.0,
        entryThresholdLower: -7.0,
        exitThresholdUpper: 6.0,
        exitThresholdLower: -6.0,
        includedPairs: Object.fromEntries(DEFAULT_SYMBOLS.map(p => [p, true])),
        botType: 'Dynamic DCA',
        lotSize: 0.01,
        maxPositions: 5,
        reentryDelay: 15,
        stopLoss: 500,
        takeProfit: 100,
        enableDSizeExit: true,
        dSizeExitThreshold: 6.0,
        enableTrailingStop: false,
        trailingStopPips: 20,
        newsFilter: true,
        weekendTrading: false,
        aiOptimization: true,
        gridLevels: 5,
        gridDistance: 20,
        gridDistanceMultiplier: 1.5,
        lotSizeMultiplier: 1.5,
        takeProfitType: 'fixed',
        closeOnRetrace: false,
        retracePercentage: 50,
      };
      await setDoc(docRef, defaultStrategy);
      return NextResponse.json({ success: true, data: { id: userId, ...defaultStrategy } });
    }
  } catch (error) {
    console.error("Error fetching strategy:", error);
    const errorMessage = (error as Error).message;
    const status = errorMessage === 'User not authenticated' ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const strategy: AutoBotStrategy = await request.json();
    const { id, ...strategyData } = strategy;

    const docRef = doc(strategyCollection, id || userId);
    await setDoc(docRef, strategyData, { merge: true });

    return NextResponse.json({ success: true, message: 'Strategy saved successfully.' });
  } catch (error) {
    console.error("Error saving strategy:", error);
    const errorMessage = (error as Error).message;
    const status = errorMessage === 'User not authenticated' ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }
}
