import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK using Application Default Credentials (ADC).
 * On Firebase App Hosting, this automatically uses the built-in service identity,
 * removing the need for a manual Service Account JSON and preventing parsing errors.
 */
export function getFirebaseAdmin() {
  // 1. If already initialized, return the existing app instance
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  try {
    console.log("Initializing Firebase Admin with Default Credentials...");
    // 2. initializeApp() without arguments uses ADC (Application Default Credentials)
    // This is the most stable method for App Hosting and Google Cloud environments.
    return admin.initializeApp();
  } catch (error) {
    console.error("CRITICAL: Firebase Admin initialization failed:", error);
    throw error;
  }
}

/**
 * Helper to get Firestore directly using the safe initialization logic.
 */
export const getFirestoreDb = () => {
  const app = getFirebaseAdmin();
  return app.firestore();
};
