/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

// This is the main function that will be triggered by Cloud Scheduler.
export const runAutoBotScanner = onSchedule("every 10 minutes", async () => {
  logger.info("Auto Bot Scanner function triggered by scheduler.");

  // Get the URL of your deployed Next.js application from environment variables.
  // You need to set this in your Firebase environment configuration.
  // Example command: firebase functions:config:set settings.app_url="https://your-app-url.web.app"
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    logger.error(
      "APP_URL environment variable not set. Cannot trigger scanner."
    );
    return;
  }

  const scanUrl = `${appUrl}/api/autobot/scan`;

  try {
    // We use fetch to call the API route in our Next.js app.
    // The "x-internal-cron" header can be used as a simple security measure
    // to ensure the request is coming from our own trusted function.
    const response = await fetch(scanUrl, {
      method: "POST",
      headers: { "x-internal-cron": "true" },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API scan route failed with status ${response.status}: ${errorBody}`
      );
    }

    const result = await response.json();
    logger.info("Successfully called scanner API.", { result });
  } catch (error) {
    logger.error("Error calling scanner API route:", error);
  }
});
