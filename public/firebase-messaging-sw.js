
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCMhxzeh_qZM8MC8_3Nq_hPbmwuqIwyCjY",
  authDomain: "abacusace-mmnqw.firebaseapp.com",
  projectId: "abacusace-mmnqw",
  storageBucket: "abacusace-mmnqw.appspot.com",
  messagingSenderId: "937539932258",
  appId: "1:937539932258:web:55fe45cb88a03298e1013b"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
