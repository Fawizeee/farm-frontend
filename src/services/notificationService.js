import { getMessaging, getToken, onMessage, isSupported, deleteToken } from 'firebase/messaging';
import app from '../config/firebase';
import apiClient from './apiClient';
import { trackNotificationClick } from './adminService';
import { getDeviceId } from '../utils/deviceCookie';

// VAPID key - Get from environment variable
// Set REACT_APP_FIREBASE_VAPID_KEY in your .env file
const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

// Get messaging instance
let messaging = null;

const getMessagingInstance = async () => {
  if (messaging) {
    return messaging;
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  // Check if Firebase app is initialized
  if (!app) {
    // Don't log warning here - it's expected if Firebase isn't configured
    return null;
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Cloud Messaging is not supported in this browser');
      return null;
    }

    messaging = getMessaging(app);
    return messaging;
  } catch (err) {
    console.error('Firebase messaging initialization error:', err);
    return null;
  }
};

/**
 * Request notification permission from the user
 * @returns {Promise<boolean>} - Returns true if permission is granted, false otherwise
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission has been denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Get FCM token for the current device
 * @returns {Promise<string|null>} - Returns FCM token or null if unavailable
 */
export const getFCMToken = async () => {
  const messagingInstance = await getMessagingInstance();

  if (!messagingInstance) {
    console.warn('Firebase messaging is not initialized');
    return null;
  }

  try {
    console.log('Attempting to get FCM token...');
    console.log('VAPID Key configured:', VAPID_KEY && VAPID_KEY !== 'YOUR_VAPID_KEY');

    const currentToken = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready
    });

    if (currentToken) {
      // console.log('✅ FCM Token generated successfully!');
      // console.log('FCM Token (full):', currentToken);
      // console.log('FCM Token (first 20 chars):', currentToken.substring(0, 20) + '...');
      // console.log('FCM Token length:', currentToken.length);
      return currentToken || null;
    } else {
      console.warn('❌ No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('❌ An error occurred while retrieving token:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    return null;
  }
};

/**
 * Save FCM token to backend
 * @param {string} token - FCM token to save
 * @returns {Promise<boolean>} - Returns true if saved successfully
 */
export const saveTokenToBackend = async (token) => {
  try {
    console.log('🔄 Attempting to save FCM token to backend...');
    console.log('Token to save:', token ? `${token.substring(0, 20)}...` : 'null');

    // Get device ID from localStorage or generate one
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    localStorage.setItem('deviceId', deviceId);
    console.log('Device ID:', deviceId);

    console.log('Sending POST request to /api/notifications/register');
    const response = await apiClient.post('/api/notifications/register', {
      token,
      deviceId,
    });

    if (response.status === 200 || response.status === 201) {
      console.log('✅ Token saved to backend successfully!');
      console.log('Response:', response.data);
      localStorage.setItem('mufu_push_subscribed', 'true');
      return true;
    }
    console.warn('⚠️ Unexpected response status:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Error saving token to backend:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    return false;
  }
};

/**
 * Save FCM token to backend as admin token
 * @param {string} token - FCM token to save
 * @returns {Promise<boolean>} - Returns true if saved successfully
 */
export const saveAdminTokenToBackend = async (token) => {
  try {
    console.log('🔄 Attempting to save admin FCM token to backend...');
    console.log('Token to save:', token ? `${token.substring(0, 20)}...` : 'null');

    // Get device ID from localStorage or generate one
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    localStorage.setItem('deviceId', deviceId);
    console.log('Device ID:', deviceId);

    console.log('Sending POST request to /api/admin/notifications/register');
    const response = await apiClient.post('/api/admin/notifications/register', {
      token,
      deviceId,
    });

    if (response.status === 200 || response.status === 201) {
      console.log('✅ Admin token saved to backend successfully!');
      console.log('Response:', response.data);
      // Admin subscription implies regular subscription too usually, or at least active
      localStorage.setItem('mufu_push_subscribed', 'true');
      return true;
    }
    console.warn('⚠️ Unexpected response status:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Error saving admin token to backend:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    return false;
  }
};

/**
 * Unsubscribe from notifications
 * @param {string} token - FCM token to unsubscribe
 * @returns {Promise<boolean>} - Returns true if unsubscribed successfully
 */
export const unsubscribeFromNotifications = async (token) => {
  try {
    console.log('🔄 Attempting to unsubscribe from notifications...');
    console.log('Token to unsubscribe:', token ? `${token.substring(0, 20)}...` : 'null');

    // Use token as query param as per backend implementation
    const response = await apiClient.delete('/api/notifications/unsubscribe', {
      params: { token },
    });

    if (response.status === 200) {
      console.log('✅ Unsubscribed successfully form backend!');

      localStorage.removeItem('mufu_push_subscribed');

      // Also delete from Firebase if possible
      try {
        const messagingInstance = await getMessagingInstance();
        if (messagingInstance) {
          // Note: deleteToken is imported from firebase/messaging
          await deleteToken(messagingInstance);
          console.log('✅ Firebase token deleted locally');
        }
      } catch (fbError) {
        console.warn('⚠️ Could not delete firebase token locally:', fbError);
        // We still return true because backend unsubscribe was successful
      }

      return true;
    }
    console.warn('⚠️ Unexpected response status:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Error unsubscribing:', error);
    return false;
  }
};

/**
 * Initialize notification service
 * This should be called when the app loads
 * Note: This will only work if Firebase is properly configured
 */
export const initializeNotifications = async () => {
  // Check if Firebase is configured
  if (!app) {
    console.log('ℹ️ Firebase not configured. Skipping FCM initialization. Modal will still work for basic notifications.');
    console.log('💡 To enable push notifications, see FCM_SETUP_GUIDE.md for setup instructions.');
    console.log('   You need to create a .env file with Firebase configuration values.');
    return;
  }

  // Register service worker first
  // On mobile, service worker might not be available or might fail
  // This is okay - the modal can still work with basic browser notifications
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.warn('Service Worker registration failed (this is okay, especially on mobile or if Firebase is not configured):', error);
      // Don't throw - we can still show the modal and use basic notifications
      // On mobile, basic browser notifications will work even without service worker
      if (isMobileDevice()) {
        console.log('Mobile device detected - basic notifications will work without service worker');
      }
      return;
    }
  } else {
    if (isMobileDevice()) {
      console.log('Service Worker not available on this mobile browser - basic notifications will still work');
    }
  }

  // Check if user has already granted permission
  if (Notification.permission === 'granted') {
    console.log('📱 Notification permission already granted');
    // We do NOT auto-save token here anymore. 
    // If the user previously unsubscribed (deleted backend token), we don't want to auto-resubscribe them
    // just because they refreshed the page.
    // They must click 'Subscribe' in the modal/footer to re-establish the backend link.
  } else {
    console.log('ℹ️ Notification permission not granted yet. Status:', Notification.permission);
  }

  // Listen for foreground messages
  try {
    const messagingInstance = await getMessagingInstance();
    if (messagingInstance) {
      onMessage(messagingInstance, (payload) => {
        console.log('Message received in foreground:', payload);

        // Show notification
        if (payload.notification) {
          showNotification(
            payload.notification.title || 'Mufu Farm',
            payload.notification.body || 'You have a new notification',
            payload.notification.icon,
            payload.data // Pass data for click tracking
          );
        }
      });
    }
  } catch (error) {
    console.warn('Failed to set up message listener (Firebase may not be configured):', error);
  }
};

/**
 * Show a browser notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} icon - Notification icon URL
 * @param {object} data - Notification data payload (for click tracking)
 */
export const showNotification = (title, body, icon = '/logo192.png', data = null) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon,
      badge: '/logo192.png',
      tag: 'mufu-farm-notification',
    });

    // Add click handler to redirect and track click
    notification.onclick = async () => {
      // Track click if we have notification data
      if (data && data.notification_id) {
        try {
          // Use device_id from payload (from backend) or get from cookie
          const deviceId = data.device_id || getDeviceId();
          if (deviceId) {
            await trackNotificationClick(
              parseInt(data.notification_id),
              deviceId
            );
            console.log('Notification click tracked');
          }
        } catch (error) {
          console.error('Failed to track notification click:', error);
          // Continue even if tracking fails
        }
      }

      window.focus();

      // Check if this is an admin notification with redirect URL
      if (data && (data.is_admin === 'true' || data.redirect_url)) {
        const redirectUrl = data.redirect_url || '/admin/orders';
        window.location.href = redirectUrl;
      } else {
        // Regular user notification - redirect to home
        window.location.href = '/';
      }

      notification.close();
    };
  }
};

/**
 * Generate a unique device ID
 * @returns {string} - Unique device ID
 */
const generateDeviceId = () => {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Check if device is mobile
 * @returns {boolean}
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
};

/**
 * Check if notifications are supported
 * @returns {boolean}
 */
export const isNotificationSupported = () => {
  // Basic notification support check
  const hasNotification = 'Notification' in window;

  // For mobile, we can still show the modal even without service worker
  // The browser's native notification API will work
  if (isMobileDevice()) {
    return hasNotification;
  }

  // For desktop, prefer service worker support for better FCM integration
  return hasNotification && 'serviceWorker' in navigator;
};

/**
 * Check if user has already granted notification permission
 * @returns {boolean}
 */
export const hasNotificationPermission = () => {
  return Notification.permission === 'granted';
};

/**
 * Check if user has denied notification permission
 * @returns {boolean}
 */
export const isNotificationDenied = () => {
  return Notification.permission === 'denied';
};

