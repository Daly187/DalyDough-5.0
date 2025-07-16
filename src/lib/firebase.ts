
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

function initializeFirebase() {
    if (getApps().length > 0) {
        return getApp();
    }

    const allVarsExist = Object.values(firebaseConfig).every(v => !!v && !v.startsWith("YOUR_"));
    
    if(!allVarsExist) {
        console.warn('Firebase config is missing or uses placeholder values. Check your .env file and ensure NEXT_PUBLIC_FIREBASE_ variables are set. Authentication will be disabled.');
        return null;
    }

    return initializeApp(firebaseConfig);
}

const app: FirebaseApp | null = initializeFirebase();
const auth: Auth = app ? getAuth(app) : ({} as Auth);

export { app, auth };
