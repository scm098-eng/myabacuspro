
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

/**
 * Firebase configuration object.
 * Prioritizes environment variables for security and flexibility across environments.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCMhxzeh_qZM8MC8_3Nq_hPbmwuqIwyCjY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "abacusace-mmnqw.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "abacusace-mmnqw",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "abacusace-mmnqw.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "937539932258",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:937539932258:web:55fe45cb88a03298e1013b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Conditionally initialize Analytics
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      getAnalytics(firebaseApp);
    }
  });
}

export { firebaseApp };
