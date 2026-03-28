
import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Standardized Firebase Admin initialization using the modular SDK.
 * This version uses the modern v12+ exports to ensure compatibility
 * with Next.js and avoid "INTERNAL" property resolution errors.
 */
export function getFirebaseAdmin(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  try {
    return initializeApp();
  } catch (e) {
    console.error("Firebase Admin Init Error:", e);
    throw e;
  }
}

/**
 * Helper to get Firestore directly using the safe initialization logic.
 */
export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseAdmin());
}
