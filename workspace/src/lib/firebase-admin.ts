
import { initializeApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Standardized Firebase Admin initialization using Application Default Credentials.
 * Syncing with main src directory for build stability.
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
    console.error("Firebase Admin Init Error:", error);
    throw error;
  }
}

/**
 * Explicitly exported helper to get Firestore instance.
 * Renamed internal reference to avoid collision with 'getFirestore' import.
 */
export function getFirestoreDb(): Firestore {
  const adminApp = getFirebaseAdmin();
  return getAdminFirestore(adminApp);
}

// Fixed merged declaration collision by using a clear internal reference name
export const getFirestoreInstance = () => getFirestoreDb();
