import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Detecta si el navegador soporta Push Notifications.
 * En iOS, Push solo funciona a partir de iOS 16.4+ Y con la app instalada como PWA.
 */
function getPushSupport() {
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  const hasNotification = 'Notification' in window;

  // iOS Safari: solo soporta push si está en modo standalone (añadida a pantalla de inicio)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  if (isIOS && !isStandalone) {
    return { supported: false, reason: 'ios-not-installed' };
  }

  if (!hasServiceWorker || !hasPushManager || !hasNotification) {
    return { supported: false, reason: 'not-supported' };
  }

  return { supported: true, reason: null };
}

/**
 * Pide permiso de notificación de forma compatible con todos los navegadores,
 * incluyendo Safari iOS que no soporta la API basada en Promises en versiones antiguas.
 */
function requestNotificationPermission() {
  return new Promise((resolve, reject) => {
    if (!('Notification' in window)) {
      reject(new Error('Notifications not supported'));
      return;
    }

    // Si ya está granted o denied, devolver inmediatamente
    if (Notification.permission === 'granted') {
      resolve('granted');
      return;
    }
    if (Notification.permission === 'denied') {
      resolve('denied');
      return;
    }

    // Usar callback-style para compatibilidad máxima con Safari/iOS
    const result = Notification.requestPermission((permission) => {
      resolve(permission);
    });

    // Si el navegador sí devuelve una Promise (Chrome, Firefox modernos), usarla también
    if (result && typeof result.then === 'function') {
      result.then(resolve).catch(reject);
    }
  });
}

export function useNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pushSupport, setPushSupport] = useState(null); // null = pendiente

  useEffect(() => {
    const support = getPushSupport();
    setPushSupport(support);

    if (support.supported) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.warn('Error al verificar suscripción:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async () => {
    const support = getPushSupport();

    // iOS no instalada como PWA
    if (support.reason === 'ios-not-installed') {
      return { success: false, reason: 'ios-not-installed' };
    }

    // Navegador sin soporte
    if (!support.supported) {
      return { success: false, reason: 'not-supported' };
    }

    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;

      // Pedir permiso con compatibilidad iOS
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        return { success: false, reason: 'permission-denied' };
      }

      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VITE_VAPID_PUBLIC_KEY no está definido en las variables de entorno');
      }

      // Crear suscripción push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Guardar en Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .insert([{ subscription }]);

      if (error) throw error;

      setIsSubscribed(true);
      return { success: true };
    } catch (error) {
      console.error('Error al suscribirse a notificaciones:', error);
      return { success: false, reason: 'error', message: error.message };
    } finally {
      setLoading(false);
    }
  };

  return { isSubscribed, loading, pushSupport, subscribe };
}

// Utilidad para convertir la llave pública VAPID de base64 a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
