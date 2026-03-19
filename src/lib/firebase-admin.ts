
import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK with extreme safety.
 * Handles cases where the service account variable might be 
 * missing, empty, or set to the literal string "undefined".
 */
export function getFirebaseAdmin() {
  // 1. If already initialized, return the first app instance
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // 2. Check for service account key in environment variables
  // Supporting common naming conventions
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT;
  
  // 3. Fallback to default credentials if variable is missing or literal "undefined"
  if (!serviceAccount || serviceAccount === "undefined") {
    console.log("Admin Init: No service account found, using default environment credentials.");
    return admin.initializeApp(); 
  }

  try {
    // 4. Handle case where it might already be an object
    if (typeof serviceAccount === 'object') {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    // 5. Try to parse the string
    const parsedAccount = JSON.parse(serviceAccount);
    return admin.initializeApp({
      credential: admin.credential.cert(parsedAccount),
    });
  } catch (error) {
    // 6. Final safety: If parsing fails, fall back to default instead of crashing
    console.error("CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Falling back to default credentials.");
    return admin.initializeApp();
  }
}
