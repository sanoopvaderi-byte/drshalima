// Service Worker for Dr. Shalima's Mind Clinic — Professional Mobile Push Notifications
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Listen for push events from web push servers
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        data = {
            title: "Dr. Shalima's Mind Clinic",
            body: event.data ? event.data.text() : 'New counselling session notification'
        };
    }
    const title = data.title || "Dr. Shalima's Mind Clinic";
    const options = {
        body: data.body || 'Counselling session notification alert',
        icon: 'logo.jpg',
        badge: 'logo.jpg',
        tag: data.tag || ('clinic_push_' + Date.now()),
        vibrate: [250, 120, 250, 120, 400],
        requireInteraction: true,
        renotify: true,
        data: { url: data.url || './index.html' }
    };
    event.waitUntil(
        self.registration.showNotification(title, options).catch(() => {
            delete options.icon;
            delete options.badge;
            return self.registration.showNotification(title, options);
        })
    );
});

// Listen for direct notification commands from the clinic web app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_MOBILE_NOTIFICATION') {
        const { title, body, tag, url, icon } = event.data;
        const iconPath = icon || 'logo.jpg';
        const notifOptions = {
            body: body || '',
            icon: iconPath,
            badge: iconPath,
            tag: tag || ('clinic_mobile_' + Date.now()),
            vibrate: [250, 120, 250, 120, 400],
            requireInteraction: true,
            renotify: true,
            data: { url: url || './index.html' }
        };
        event.waitUntil(
            self.registration.showNotification(title || "Dr. Shalima's Mind Clinic", notifOptions).catch(() => {
                delete notifOptions.icon;
                delete notifOptions.badge;
                return self.registration.showNotification(title || "Dr. Shalima's Mind Clinic", notifOptions);
            })
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || './index.html';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
