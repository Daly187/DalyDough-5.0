
"use server";

import { db } from "@/lib/firebase/firestore";
import type { BotConfigurationData } from "@/lib/types";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

/**
 * Saves a new bot configuration to the 'bots' collection in Firestore.
 * @param botData The configuration data for the new bot.
 * @returns The ID of the newly created document.
 */
export async function addBot(botData: BotConfigurationData, pair: string) {
    try {
        const docRef = await addDoc(collection(db, "bots"), {
            ...botData,
            pair: pair,
            status: 'active', // Set initial status
            createdAt: serverTimestamp(), // Add a server-side timestamp
            profit_loss: 0,
        });
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: (e as Error).message };
    }
}

/**
 * Fetches all bots from the 'bots' collection in Firestore.
 * @returns An array of bot objects.
 */
export async function getBots() {
    try {
        const querySnapshot = await getDocs(collection(db, "bots"));
        const bots = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, data: bots };
    } catch (e) {
        console.error("Error getting documents: ", e);
        return { success: false, error: (e as Error).message };
    }
}
