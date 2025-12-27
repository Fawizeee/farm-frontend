import React, { useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, getFCMToken, saveTokenToBackend } from '../../services/notificationService';
import '../css/NotificationPermissionModal.css';

const NotificationPermissionModal = ({ onClose, onPermissionGranted }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState(null);

  const handlePermissionGranted = useCallback(async () => {
    console.log('🎉 Notification permission granted! Getting FCM token...');
    try {
      const token = await getFCMToken();
      if (token) {
        console.log('✅ FCM token obtained in modal, saving to backend...');
        const saved = await saveTokenToBackend(token);
        if (saved) {
          console.log('✅ Token saved successfully from modal');
        } else {
          console.warn('⚠️ Token save failed from modal');
        }
        if (onPermissionGranted) {
          onPermissionGranted();
        }
      } else {
        console.warn('⚠️ No FCM token obtained in modal (Firebase may not be configured)');
      }
    } catch (err) {
      console.error('❌ Error getting FCM token in modal:', err);
    }
  }, [onPermissionGranted]);

  useEffect(() => {
    // Check if user has already granted permission
    if (Notification.permission === 'granted') {
      handlePermissionGranted();
    }
  }, [handlePermissionGranted]);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const granted = await requestNotificationPermission();
      
      if (granted) {
        console.log('✅ User granted notification permission!');
        // Try to get FCM token, but don't fail if Firebase isn't configured
        try {
          await handlePermissionGranted();
        } catch (err) {
          console.warn('Could not get FCM token (Firebase may not be configured):', err);
          // Still close the modal - basic notifications will work
        }
        onClose();
      } else {
        setError('Notification permission was denied. Please enable it in your browser settings.');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setError('An error occurred while requesting notification permission.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleNotNow = () => {
    // Store that user dismissed the modal
    localStorage.setItem('notificationModalDismissed', 'true');
    localStorage.setItem('notificationModalDismissedTime', Date.now().toString());
    onClose();
  };

  // Don't show modal if permission is already granted or denied
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return null;
  }

  return (
    <div className="notification-modal-overlay">
      <div className="notification-modal">
        <div className="notification-modal-header">
          <div className="notification-icon">
            🔔
          </div>
          <h2>Stay Updated with Mufu Farm</h2>
        </div>
        
        <div className="notification-modal-body">
          <p>
            Get instant notifications about:
          </p>
          <ul>
            <li>📦 Order status updates</li>
            <li>🎉 Special offers and promotions</li>
            <li>🐟 New product arrivals</li>
            <li>📢 Important announcements</li>
          </ul>
          {error && (
            <div className="notification-error">
              {error}
            </div>
          )}
        </div>

        <div className="notification-modal-footer">
          <button
            className="notification-btn-secondary"
            onClick={handleNotNow}
            disabled={isRequesting}
          >
            Not Now
          </button>
          <button
            className="notification-btn-primary"
            onClick={handleEnableNotifications}
            disabled={isRequesting}
          >
            {isRequesting ? 'Enabling...' : 'Enable Notifications'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionModal;

