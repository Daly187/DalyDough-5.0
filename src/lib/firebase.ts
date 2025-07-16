
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Robust check to ensure all required environment variables are present and not placeholders.
if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('YOUR_')) {
  // Initialize Firebase only if the config is valid.
  // The getApps().length check prevents re-initializing the app on hot reloads.
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} else {
  console.warn('Firebase config is missing or uses placeholder values. Check your .env file and ensure NEXT_PUBLIC_FIREBASE_ variables are set. Authentication will be disabled.');
}


export { app, auth };
