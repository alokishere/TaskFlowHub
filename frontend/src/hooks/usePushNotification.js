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

const getPublicVapidKey = async () => {
  const keyFromEnv = String(import.meta.env.VITE_VAPID_PUBLIC_KEY || '').trim();
  if (keyFromEnv) return keyFromEnv;

  try {
    const response = await API.get('/push/public-key');
    const keyFromServer = String(response?.data?.publicKey || '').trim();
    if (keyFromServer) return keyFromServer;
  } catch {
    // We'll throw a clear error below.
  }

  throw new Error('Missing VAPID public key. Set VITE_VAPID_PUBLIC_KEY or configure VAPID_PUBLIC_KEY on backend.');
};

const getServiceWorkerRegistration = async () => {
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  return registration;
};

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

    const registration = await getServiceWorkerRegistration();
    const existingSubscription = await registration.pushManager.getSubscription();
    setIsSubscribed(Boolean(existingSubscription));

    if (existingSubscription) {
      const payload = userId ? { userId, subscription: existingSubscription } : { subscription: existingSubscription };
      try {
        await API.post('/push/subscribe', payload);
      } catch {
        // Local state should still reflect actual browser subscription.
      }
    }
  }, [userId]);

  useEffect(() => {
    checkSubscription().catch(() => setIsSubscribed(false));
  }, [checkSubscription]);

  const subscribe = useCallback(async () => {
    setLoading(true);

    try {
      if (!canUsePushNotifications()) {
        throw new Error('Push notifications are not supported in this browser.');
      }

      const vapidPublicKey = await getPublicVapidKey();

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted.');
      }

      const registration = await getServiceWorkerRegistration();

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      const payload = userId ? { userId, subscription } : { subscription };
      await API.post('/push/subscribe', payload);

      setIsSubscribed(true);
      return true;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);

    try {
      if (!canUsePushNotifications()) {
        const payload = userId ? { userId } : {};
        await API.post('/push/unsubscribe', payload);
        setIsSubscribed(false);
        return true;
      }

      const existingRegistration = await navigator.serviceWorker.getRegistration();
      const registration = existingRegistration || await getServiceWorkerRegistration();
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        const payload = userId
          ? { userId, endpoint: existingSubscription.endpoint }
          : { endpoint: existingSubscription.endpoint };
        await API.post('/push/unsubscribe', payload);
        await existingSubscription.unsubscribe();
      } else {
        const payload = userId ? { userId } : {};
        await API.post('/push/unsubscribe', payload);
      }
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
