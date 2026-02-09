
import * as admin from 'firebase-admin';

// This function initializes the Firebase Admin SDK.
// It checks if the SDK has already been initialized to prevent errors.
export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // When running in a server environment that is not a managed Firebase environment
  // (like a Next.js Server Action), we need to provide the credentials manually.
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
  );

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
