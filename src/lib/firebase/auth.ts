
'use client';

import { 
    getAuth, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    signOut as firebaseSignOut
} from "firebase/auth";
import { app } from "./config";

export const auth = getAuth(app);

// Sign in with email and password
export async function signInWithEmail(email: string, password: string): Promise<{ error: Error | null }> {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}

// Sign out
export async function signOut(): Promise<{ error: Error | null }> {
    try {
        await firebaseSignOut(auth);
        return { error: null };
    } catch (error) {
        return { error: error as Error };
    }
}
