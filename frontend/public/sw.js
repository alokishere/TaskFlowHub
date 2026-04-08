self.addEventListener('push', (event) => {
  const fallback = {
    title: '⏰ Punch-In Reminder',
    body: 'Please login and mark attendance'
  };

  let data = fallback;

  if (event.data) {
    try {
      data = { ...fallback, ...event.data.json() };
    } catch (_error) {
      data = fallback;
    }
  }

  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: {
      url: data?.data?.url || '/employee'
    }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || '/employee';
  const destination = targetUrl.startsWith('http')
    ? targetUrl
    : new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url.startsWith(self.location.origin)) {
          client.navigate(destination);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(destination);
      }

      return null;
    })
  );
});
