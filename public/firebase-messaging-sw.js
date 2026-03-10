
// This is a minimal service worker to prevent 404s when FCM tries to register.
// Real push notification logic can be added here if needed for background handling.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-sw.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-sw.js');

firebase.initializeApp({
  apiKey: "AIzaSyCMhxzeh_qZM8MC8_3Nq_hPbmwuqIwyCjY",
  projectId: "abacusace-mmnqw",
  messagingSenderId: "937539932258",
  appId: "1:937539932258:web:55fe45cb88a03298e1013b"
});

const messaging = firebase.messaging();
