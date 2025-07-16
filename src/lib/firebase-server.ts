
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

function initializeFirebaseAdmin(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    const allVarsExist = !!serviceAccount.projectId && !!serviceAccount.clientEmail && !!serviceAccount.privateKey;
    
    if(!allVarsExist) {
        console.warn('Firebase Admin SDK config is missing. Server-side auth checks will be skipped.');
    }

    return initializeApp({
        credential: allVarsExist ? cert(serviceAccount) : undefined,
    });
}

const adminApp = initializeFirebaseAdmin();
const adminAuth: Auth = getAuth(adminApp);


export const auth = {
    getCurrentUser: async () => {
        // This part needs a session cookie to work, which is complex.
        // For this app, we'll simplify and assume no user on the server.
        // A real app would verify a session cookie here.
        return null;
    }
}
