
// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in your app's Firebase config object
firebase.initializeApp({
  "projectId": "abacusace-mmnqw",
  "appId": "1:937539932258:web:55fe45cb88a03298e1013b",
  "storageBucket": "abacusace-mmnqw.appspot.com",
  "apiKey": "AIzaSyCMhxzeh_qZM8MC8_3Nq_hPbmwuqIwyCjY",
  "authDomain": "abacusace-mmnqw.firebaseapp.com",
  "messagingSenderId": "937539932258"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/logo_icon.png?alt=media',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
