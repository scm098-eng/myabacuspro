
import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK.
 * Uses applicationDefault() which is the recommended approach for 
 * Google Cloud environments like Firebase App Hosting.
 */
export function getFirebaseAdmin() {
  // 1. If already initialized, return the existing app
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // 2. Check for service account key in environment variables
  // Supporting both common naming conventions
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccountKey && serviceAccountKey !== 'undefined') {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error("Failed to parse Firebase Service Account Key:", e);
      // Fall through to default credentials if parsing fails
    }
  }

  /**
   * 3. Default Fallback
   * On Firebase App Hosting or Google Cloud, this will automatically use the 
   * environment's default service account. This is the most reliable method
   * and avoids "undefined" parsing errors.
   */
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
