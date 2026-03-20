import * as admin from 'firebase-admin';

/**
 * Standardized Firebase Admin initialization using Application Default Credentials.
 * This version removes manual parsing of service account JSONs to prevent
 * SyntaxErrors when environment variables are missing or malformed.
 */
export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  try {
    console.log("Admin Init: Using Application Default Credentials...");
    return admin.initializeApp();
  } catch (e) {
    console.error("Firebase Admin Init Error:", e);
    throw e;
  }
}

export const getFirestore = () => getFirebaseAdmin().firestore();
