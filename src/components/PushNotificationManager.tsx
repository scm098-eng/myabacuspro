
'use client';

import { useEffect, useRef } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseApp } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const VAPID_KEY = "BF27zRYbNBqLyR0w1XZVSCWK0YNgG7M9DymtcLAPr6A0gUoT00lIn-q7fpPhgYgOwcj91lmXUL7KvTV4o0Yd7J8";

export default function PushNotificationManager() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (!user || hasRequestedRef.current) return;

    const setupMessaging = async () => {
      try {
        // Only run in supported browsers
        if (!('serviceWorker' in navigator) || !('Notification' in window)) {
          console.warn("Push notifications not supported in this browser.");
          return;
        }

        const messaging = getMessaging(firebaseApp);

        // Check current permission
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;
        }

        if (Notification.permission === 'granted') {
          const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
          
          if (currentToken) {
            // Save token to Firestore if it changed or is missing
            if (profile && profile.fcmToken !== currentToken) {
              const db = getFirestore(firebaseApp);
              await updateDoc(doc(db, 'users', user.uid), {
                fcmToken: currentToken
              });
              console.log("FCM Token registered successfully.");
            }
          }
        }

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
          toast({
            title: payload.notification?.title || "New Activity",
            description: payload.notification?.body || "Check your activity hub.",
          });
        });

        hasRequestedRef.current = true;
      } catch (error) {
        console.error("FCM Setup Error:", error);
      }
    };

    setupMessaging();
  }, [user, profile, toast]);

  return null;
}
