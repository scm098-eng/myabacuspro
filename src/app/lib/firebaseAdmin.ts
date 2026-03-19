import * as admin from "firebase-admin";

/**
 * Standardized Firebase Admin initialization used across the app.
 * Moved logic inside the getter to prevent SyntaxErrors during global module evaluation.
 */
export const getFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccount || serviceAccount === "undefined") {
    return admin.initializeApp();
  }

  try {
    const config = typeof serviceAccount === 'object' ? serviceAccount : JSON.parse(serviceAccount);
    return admin.initializeApp({
      credential: admin.credential.cert(config),
    });
  } catch (e) {
    console.error("Firebase Admin initialization failed, using default credentials.");
    return admin.initializeApp();
  }
};

export const getFirestore = () => getFirebaseAdmin().firestore();
