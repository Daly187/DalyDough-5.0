
"use server";

import { db } from "@/lib/firebase/firestore";
import { getForexData } from "@/lib/fmp";
import type { Bot, BotConfigurationData } from "@/lib/types";
import { collection, addDoc, getDocs, serverTimestamp, query, where, DocumentData } from "firebase/firestore";

/**
 * Saves a new bot configuration to the 'bots' collection in Firestore.
 * @param botData The configuration data for the new bot.
 * @returns The ID of the newly created document.
 */
export async function addBot(botData: BotConfigurationData, pair: string, uid: string) {
    if (!uid) {
        return { success: false, error: "User is not authenticated." };
    }
    try {
        const dScoreData = await getForexData(pair);
        
        const docRef = await addDoc(collection(db, "bots"), {
            ...botData,
            pair: pair,
            status: 'active', // Set initial status
            createdAt: serverTimestamp(), // Add a server-side timestamp
            profit_loss: 0,
            strategy: botData.botType || "DCA Grid",
            d_score_entry: dScoreData?.dScore ?? 0,
            uid: uid, // Associate the bot with the user
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
export async function getBots(uid?: string) {
    try {
        let q;
        if (uid) {
            // If a UID is provided, fetch only that user's bots.
            q = query(collection(db, "bots"), where("uid", "==", uid));
        } else {
            // Otherwise, fetch all bots (useful for admin views, but be careful with rules).
            q = query(collection(db, "bots"));
        }
        
        const querySnapshot = await getDocs(q);
        const bots: Bot[] = [];
        querySnapshot.forEach((doc) => {
            bots.push({ id: doc.id, ...doc.data() } as Bot);
        });

        return { success: true, data: bots };
    } catch (e) {
        console.error("Error getting documents: ", e);
        return { success: false, error: (e as Error).message };
    }
}
