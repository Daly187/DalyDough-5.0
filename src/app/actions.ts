
"use server";

import { db } from "@/lib/firebase/firestore";
import type { Bot } from "@/lib/types";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";

/**
 * Fetches all bots for a specific user from the 'bots' collection in Firestore.
 * @param uid The user's ID.
 * @returns An array of bot objects.
 */
export async function getBots(uid: string) {
    if (!uid) {
        return { success: false, error: "User ID is required to fetch bots." };
    }
    try {
        const q = query(collection(db, "bots"), where("uid", "==", uid));
        
        const querySnapshot = await getDocs(q);
        const bots: Bot[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Convert Firestore Timestamp to a serializable object if it exists
            const botData = {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds } : null,
            } as Bot;
            bots.push(botData);
        });

        return { success: true, data: bots };
    } catch (e) {
        console.error("Error getting documents: ", e);
        return { success: false, error: (e as Error).message };
    }
}

    