import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Initializes the Firebase Admin SDK using Application Default Credentials (ADC).
 * Explicitly passing the projectId helps the Auth library resolve metadata
 * in restricted server environments.
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
 * Helper to get Firestore directly using the modular initialization logic.
 */
export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseAdmin());
}
