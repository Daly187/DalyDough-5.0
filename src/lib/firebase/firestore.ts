
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { app } from "./config";

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Export firestore functions to be used client-side
export { doc, updateDoc };
