
import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK.
 * Uses applicationDefault() which is the recommended approach for 
 * Google Cloud environments like Firebase App Hosting.
 */
export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Check if we have a service account key in env (useful for local dev or non-GCP environments)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e);
    }
  }

  // Default to application credentials (works automatically in Firebase App Hosting)
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
