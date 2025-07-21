

import type { Notification } from './types';

// --- Mock Data (to be phased out or used for dev) ---
// This data is fetched from Firestore and this mock data is no longer used.
export const activeBotsData = [];
export const closedBotsData = [];

export const notificationData: Notification[] = [
  { id: '1', type: 'new_bot', title: 'New Bot Launched', description: 'Your new DCA Grid bot for EUR/USD is now active.', timestamp: '2 minutes ago', read: false },
  { id: '2', type: 'status_change', title: 'Bot Paused', description: 'The Trend Rider bot for GBP/USD has been manually paused.', timestamp: '15 minutes ago', read: false },
  { id: '3', type: 'bot_closed', title: 'Trade Closed', description: 'Your GBP/JPY bot hit Take Profit for +$512.60.', timestamp: '1 hour ago', read: true },
  { id: '4', type: 'status_change', title: 'Bot Error', description: 'XAU/USD bot has encountered a connection error.', timestamp: '3 hours ago', read: true },
];
