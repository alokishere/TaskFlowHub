import { useCallback, useEffect, useState } from 'react';
import API from '../services/api';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const getPublicVapidKey = () =>
  String(
    import.meta.env.VITE_VAPID_PUBLIC_KEY ||'BK7bE0TMHBjI916P-W4HhAFZdvExYH-OxgbVVaKu21R7vv2ohyntxg02TioQX0TbGqcEIk57MH8RokTO1b1DIAs'
  ).trim();

const canUsePushNotifications = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

const usePushNotification = (userId) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!canUsePushNotifications()) {
      setIsSubscribed(false);
      return;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    const existingSubscription = await registration.pushManager.getSubscription();
    setIsSubscribed(Boolean(existingSubscription));
  }, []);

  useEffect(() => {
    checkSubscription().catch(() => setIsSubscribed(false));
  }, [checkSubscription]);

  const subscribe = useCallback(async () => {
    if (!userId) {
      throw new Error('userId is required to subscribe for push notifications.');
    }

    const vapidPublicKey = getPublicVapidKey();
    if (!vapidPublicKey) {
      throw new Error('Missing VAPID public key in frontend environment.');
    }

    setLoading(true);

    try {
      if (!canUsePushNotifications()) {
        throw new Error('Push notifications are not supported in this browser.');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted.');
      }

      const registration = await navigator.serviceWorker.register('/sw.js');

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      await API.post('/push/subscribe', { userId, subscription });

      setIsSubscribed(true);
      return true;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const unsubscribe = useCallback(async () => {
    if (!userId) {
      throw new Error('userId is required to unsubscribe from push notifications.');
    }

    setLoading(true);

    try {
      if (!canUsePushNotifications()) {
        await API.post('/push/unsubscribe', { userId });
        setIsSubscribed(false);
        return true;
      }

      const existingRegistration = await navigator.serviceWorker.getRegistration();
      const registration = existingRegistration || await navigator.serviceWorker.register('/sw.js');
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      await API.post('/push/unsubscribe', { userId });
      setIsSubscribed(false);
      return true;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    isSubscribed,
    loading,
    subscribe,
    unsubscribe
  };
};

export default usePushNotification;
