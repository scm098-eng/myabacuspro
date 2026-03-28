
import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Initializes the Firebase Admin SDK using Application Default Credentials (ADC).
 * This modular approach is more reliable in Next.js environments and avoids 
 * namespace resolution issues that cause "INTERNAL" property errors.
 */
export function getFirebaseAdmin(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  try {
    console.log("Initializing Firebase Admin with modular SDK...");
    return initializeApp();
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
