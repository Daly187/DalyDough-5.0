
"use server";

import { db } from "@/lib/firebase/firestore";
import type { Bot, BotConfigurationData } from "@/lib/types";
import { collection, addDoc, getDocs, query, where, DocumentData, serverTimestamp } from "firebase/firestore";
import { getForexData } from "./lib/fmp";

// This file is now empty as all data operations have been moved to the client
// to resolve authentication context issues with server actions.
// The functions `getBots` and `addBot` are now implemented directly in the components
// that use them (`dashboard/page.tsx`, `bots/page.tsx`, and `autobot/bot-configuration.tsx`).
    
