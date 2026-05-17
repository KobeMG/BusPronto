import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export function useNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setLoading(false);
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
    setLoading(false);
  };

  const subscribe = async () => {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.ready;

      // Pedir permiso
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permiso de notificación denegado');
      }

      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VITE_VAPID_PUBLIC_KEY is not defined in environment variables');
      }

      // Crear suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Guardar en Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .insert([{ subscription }]);

      if (error) throw error;

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Error al suscribirse:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { isSubscribed, loading, subscribe };
}

// Utilidad para convertir la llave pública
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
