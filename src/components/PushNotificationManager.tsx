'use client';

import { useEffect, useRef } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseApp } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const VAPID_KEY = "BF27zRYbNBqLyR0w1XZVSCWK0YNgG7M9DymtcLAPr6A0gUoT00lIn-q7fpPhgYgOwcj91lmXUL7KvTV4o0Yd7J8";

/**
 * Manages Push Notification permissions and token registration.
 */
export default function PushNotificationManager() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    // Only attempt setup if user is logged in and we haven't already requested this session
    if (!user || hasRequestedRef.current) return;

    const setupMessaging = async () => {
      try {
        // Feature detection
        if (!('serviceWorker' in navigator) || !('Notification' in window) || !('PushManager' in window)) {
          console.warn("Push notifications are not supported in this browser.");
          return;
        }

        const messaging = getMessaging(firebaseApp);

        // Request permission if not already granted or denied
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.log("Notification permission denied by user.");
            return;
          }
        }

        if (Notification.permission === 'granted') {
          // Get registration token
          const currentToken = await getToken(messaging, { 
            vapidKey: VAPID_KEY,
            // Ensure service worker is ready before getting token
          });
          
          if (currentToken) {
            // Only update Firestore if the token has changed to save on writes
            if (profile && profile.fcmToken !== currentToken) {
              const db = getFirestore(firebaseApp);
              await updateDoc(doc(db, 'users', user.uid), {
                fcmToken: currentToken,
                updatedAt: new Date()
              });
              console.log("Device token synchronized with student profile.");
            }
          } else {
            console.warn('No registration token available. Check VAPID key configuration.');
          }
        }

        // Listen for foreground messages (app is open)
        onMessage(messaging, (payload) => {
          console.log('Foreground notification received:', payload);
          toast({
            title: payload.notification?.title || "New Message",
            description: payload.notification?.body || "Check your activity hub for details.",
          });
        });

        hasRequestedRef.current = true;
      } catch (error) {
        console.error("FCM Setup Error:", error);
      }
    };

    // Delay setup slightly to ensure app hydration is complete
    const timer = setTimeout(setupMessaging, 3000);
    return () => clearTimeout(timer);
  }, [user, profile, toast]);

  return null;
}
