
import * as admin from "firebase-admin";

/**
 * Standardized Firebase Admin initialization used across the app.
 * Adopts the robust initialization pattern to prevent crashes.
 */
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccount || serviceAccount === "undefined") {
    admin.initializeApp();
  } else {
    try {
      const config = typeof serviceAccount === 'object' ? serviceAccount : JSON.parse(serviceAccount);
      admin.initializeApp({
        credential: admin.credential.cert(config),
      });
    } catch (e) {
      console.error("Failed to parse service account in app/lib/firebaseAdmin. Falling back.");
      admin.initializeApp();
    }
  }
}

export const getFirestore = () => admin.firestore();
