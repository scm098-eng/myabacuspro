
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "abacusace-mmnqw",
  "appId": "1:937539932258:web:55fe45cb88a03298e1013b",
  "storageBucket": "abacusace-mmnqw.appspot.com",
  "apiKey": "AIzaSyCMhxzeh_qZM8MC8_3Nq_hPbmwuqIwyCjY",
  "authDomain": "abacusace-mmnqw.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "937539932258"
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
