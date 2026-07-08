import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Initializes the Firebase Admin SDK using Application Default Credentials (ADC).
 * This ensures the app works correctly in both local development and Firebase App Hosting.
 */
export function getFirebaseAdmin(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "abacusace-mmnqw";

  try {
    return initializeApp({
      projectId: projectId,
    });
  } catch (error) {
    console.error("CRITICAL: Firebase Admin initialization failed:", error);
    throw error;
  }
}

/**
 * Explicitly exported helper to get Firestore instance.
 */
export function getFirestoreDb(): Firestore {
  const adminApp = getFirebaseAdmin();
  return getAdminFirestore(adminApp);
}

// Provided for legacy compatibility
export const getFirestoreInstance = () => getFirestoreDb();
