
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firestore';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { AutoBotStrategy } from '@/lib/types';
import { botConfigurationData, pairs } from '@/lib/data';

const strategyCollection = collection(db, 'autobotStrategies');
// For this example, we'll use a single global strategy document.
// In a multi-user app, this ID would be derived from the authenticated user's ID.
const GLOBAL_STRATEGY_ID = 'global_strategy';

export async function GET() {
  try {
    const docRef = doc(strategyCollection, GLOBAL_STRATEGY_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
    } else {
      // If no strategy exists, create a default one and return it.
      const defaultStrategy: Omit<AutoBotStrategy, 'id'> = {
        ...botConfigurationData,
        entryThresholdUpper: 7.0,
        entryThresholdLower: -7.0,
        exitThresholdUpper: 6.0,
        exitThresholdLower: -6.0,
        includedPairs: Object.fromEntries(pairs.map(p => [p, true])),
      };
      await setDoc(docRef, defaultStrategy);
      return NextResponse.json({ success: true, data: { id: GLOBAL_STRATEGY_ID, ...defaultStrategy } });
    }
  } catch (error) {
    console.error("Error fetching strategy:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const strategy: AutoBotStrategy = await request.json();
    const { id, ...strategyData } = strategy;

    const docRef = doc(strategyCollection, id || GLOBAL_STRATEGY_ID);
    await setDoc(docRef, strategyData, { merge: true });

    return NextResponse.json({ success: true, message: 'Strategy saved successfully.' });
  } catch (error) {
    console.error("Error saving strategy:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
