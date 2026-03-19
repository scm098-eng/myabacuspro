import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK within a function scope.
 * This prevents SyntaxErrors during the global import phase in Next.js
 * when environment variables might be malformed or missing.
 */
export function getFirebaseAdmin() {
  // 1. Return existing instance if available
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // 2. Safely grab the environment variable
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
  
  // 3. If missing or literally "undefined", use default credentials (best for App Hosting)
  if (!serviceAccount || serviceAccount === "undefined") {
    console.log("Firebase Admin: No service account found, using default credentials.");
    return admin.initializeApp(); 
  }

  try {
    // 4. Handle both Object and String types safely
    const config = typeof serviceAccount === 'object' 
      ? serviceAccount 
      : JSON.parse(serviceAccount);

    return admin.initializeApp({
      credential: admin.credential.cert(config),
    });
  } catch (error) {
    console.error("CRITICAL: Failed to parse service account JSON. Falling back to default.");
    // 5. Final fallback to prevent the server from crashing
    return admin.initializeApp();
  }
}
