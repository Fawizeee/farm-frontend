// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Mufu Farm';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/logo192.png',
    badge: '/logo192.png',
    tag: 'mufu-farm-notification',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click - redirect to home page and track click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  const notificationData = event.notification.data;
  
  // Track click if we have notification data
  if (notificationData && notificationData.notification_id && notificationData.device_id) {
    // Note: Service workers can't access environment variables directly
    // If your backend is on a different origin, you'll need to:
    // 1. Use a build-time replacement script, or
    // 2. Configure a proxy in your React app, or
    // 3. Use the same origin for frontend and backend
    // For development, defaulting to localhost:8000
    const apiBaseUrl = 'http://localhost:8000';
    
    fetch(`${apiBaseUrl}/api/notifications/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification_id: parseInt(notificationData.notification_id),
        device_id: notificationData.device_id
      })
    }).then(response => {
      console.log('[firebase-messaging-sw.js] Click tracked:', response.ok);
    }).catch(error => {
      console.error('[firebase-messaging-sw.js] Failed to track click:', error);
    });
  }
  
  event.notification.close();

  // Determine redirect URL based on notification data
  let redirectUrl = '/';
  if (notificationData && (notificationData.is_admin === 'true' || notificationData.redirect_url)) {
    redirectUrl = notificationData.redirect_url || '/admin/orders';
  }

  // This looks to see if the current window is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // If a window is already open, focus it and navigate to redirect URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.startsWith(self.location.origin)) {
          return client.focus().then(() => {
            // Navigate to redirect URL if not already there
            const targetUrl = self.location.origin + redirectUrl;
            if (client.url !== targetUrl) {
              return client.navigate(redirectUrl);
            }
          });
        }
      }
      // If no window is open, open a new one to the redirect URL
      if (clients.openWindow) {
        return clients.openWindow(redirectUrl);
      }
    })
  );
});

