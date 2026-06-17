import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';



// Tomar control de todos los tabs abiertos inmediatamente al activarse
clientsClaim();

// Escuchar el mensaje SKIP_WAITING que envía el prompt de actualización
// Sin esto, el nuevo SW se queda en estado 'waiting' para siempre
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Esto es vital para que VitePWA inyecte los archivos a cachear
precacheAndRoute(self.__WB_MANIFEST);
// Limpiar cachés de versiones anteriores
cleanupOutdatedCaches();

// Escuchar el evento 'push' del servidor
self.addEventListener('push', (event) => {
  let data = { title: 'BusPronto', body: 'Tienes una nueva notificación' };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('Error parseando data de push:', e);
    data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: '/logo192x192.png',
    badge: '/logo32x32.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Ver ahora' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejar el clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una ventana abierta, enfocarla
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
