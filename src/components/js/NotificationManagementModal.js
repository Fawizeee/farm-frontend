import React, { useState, useEffect } from 'react';
import {
    requestNotificationPermission,
    getFCMToken,
    saveTokenToBackend,
    unsubscribeFromNotifications
} from '../../services/notificationService';
import '../css/NotificationManagementModal.css';
import { FaBell, FaBellSlash, FaTimes, FaSpinner } from 'react-icons/fa';

const NotificationManagementModal = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState(Notification.permission);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkSubscriptionStatus();
    }, []);

    const checkSubscriptionStatus = async () => {
        setIsLoading(true);
        try {
            if (Notification.permission === 'granted') {
                // If permission is granted, we check our intent flag.
                // Checking token existence via getFCMToken is unreliable as it might auto-generate.
                const isSubscribedLocally = localStorage.getItem('mufu_push_subscribed') === 'true';

                // We could verify token too, but the flag is the authority on user intent/backend sync status.
                if (isSubscribedLocally) {
                    setIsSubscribed(true);
                } else {
                    setIsSubscribed(false);
                }
            } else {
                setIsSubscribed(false);
            }
            setPermissionStatus(Notification.permission);
        } catch (err) {
            console.error('Error checking subscription status:', err);
            // Default to false if error
            setIsSubscribed(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const granted = await requestNotificationPermission();
            if (granted) {
                setPermissionStatus('granted');
                const token = await getFCMToken();
                if (token) {
                    const success = await saveTokenToBackend(token);
                    if (success) {
                        setIsSubscribed(true);
                    } else {
                        setError('Failed to save subscription to server. Please try again.');
                    }
                } else {
                    setError('Failed to generate notification token. Please checking your network connection.');
                }
            } else {
                setPermissionStatus('denied');
                setError('Notification permission denied. Please enable notifications in your browser settings.');
            }
        } catch (err) {
            console.error('Error subscribing:', err);
            setError('An error occurred while subscribing.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnsubscribe = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getFCMToken();
            if (token) {
                const success = await unsubscribeFromNotifications(token);
                if (success) {
                    localStorage.removeItem('mufu_push_subscribed');
                    setIsSubscribed(false);
                } else {
                    setError('Failed to unsubscribe on server. Please try again.');
                }
            } else {
                // If we can't get the token, we can't unsubscribe from server properly,
                // but we can at least reflect the state locally if we want.
                // But for safety, let's show an error.
                console.warn('Could not get token to unsubscribe');
                setIsSubscribed(false); // Assume unsubscribed if token issues (cleanup mostly)
            }
        } catch (err) {
            console.error('Error unsubscribing:', err);
            setError('An error occurred while unsubscribing.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="notification-modal-overlay" onClick={onClose}>
            <div className="notification-modal" onClick={e => e.stopPropagation()}>
                <div className="notification-modal-header">
                    <button className="close-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                    <div className="notification-icon">
                        {isSubscribed ? <FaBell /> : <FaBellSlash />}
                    </div>
                    <h2>Notification Settings</h2>
                </div>

                <div className="notification-modal-body">
                    {isLoading ? (
                        <div style={{ padding: '20px' }}>
                            <FaSpinner className="fa-spin" style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
                            <p style={{ marginTop: '10px' }}>Please wait...</p>
                        </div>
                    ) : (
                        <>
                            <div className={`status-indicator ${isSubscribed ? 'status-active' : 'status-inactive'}`}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: isSubscribed ? '#10b981' : '#6b7280'
                                }} />
                                {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                            </div>

                            <p>
                                {isSubscribed
                                    ? "You are currently receiving notifications about orders, offers, and updates from Mufu Farm."
                                    : "Subscribe to receive latest updates, order status, and exclusive offers directly to your device."}
                            </p>

                            {isSubscribed === false && permissionStatus === 'granted' && (
                                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '10px' }}>
                                    <em>Note: To completely block all permission requests, you must reset permissions in your browser settings (usually clicking the lock icon in the address bar).</em>
                                </p>
                            )}

                            {permissionStatus === 'denied' && !isSubscribed && (
                                <div className="notification-error" style={{ textAlign: 'left' }}>
                                    <strong>Permission Denied</strong><br />
                                    You have blocked notifications for this site. To subscribe, please reset permissions for this site in your browser settings.
                                </div>
                            )}

                            {error && (
                                <div className="notification-error">
                                    {error}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="notification-modal-footer">
                    {!isLoading && (
                        <>
                            {isSubscribed ? (
                                <button
                                    className="notification-btn-danger"
                                    onClick={handleUnsubscribe}
                                >
                                    <FaBellSlash /> Unsubscribe
                                </button>
                            ) : (
                                <button
                                    className="notification-btn-primary"
                                    onClick={handleSubscribe}
                                    disabled={permissionStatus === 'denied'}
                                >
                                    <FaBell /> Subscribe
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationManagementModal;
