
'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firestore';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { AutoBotStrategy } from '@/lib/types';
import { botConfigurationData, pairs } from '@/lib/data';
import { headers } from 'next/headers';

const strategyCollection = collection(db, 'autobotStrategies');

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
      const settingsRef = doc(db, 'userSettings', userId);
      const settingsSnap = await getDoc(settingsRef);
      let userPairs: string[] = [];
      if (settingsSnap.exists() && settingsSnap.data().symbolMappings) {
        userPairs = settingsSnap.data().symbolMappings.map((m: { apiSymbol: string }) => m.apiSymbol);
      } else {
        userPairs = ['EUR/USD', 'USD/JPY', 'GBP/USD']; // Fallback
      }
      
      const defaultStrategy: Omit<AutoBotStrategy, 'id'> = {
        ...botConfigurationData,
        entryThresholdUpper: 7.0,
        entryThresholdLower: -7.0,
        exitThresholdUpper: 6.0,
        exitThresholdLower: -6.0,
        includedPairs: Object.fromEntries(userPairs.map(p => [p, true])),
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
