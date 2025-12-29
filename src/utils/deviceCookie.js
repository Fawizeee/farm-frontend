import apiClient from '../services/apiClient';

const DEVICE_ID_COOKIE_NAME = 'device_id';

/**
 * Get device ID from cookie
 */
export const getDeviceId = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === DEVICE_ID_COOKIE_NAME) {
            return value;
        }
    }
    return null;
};

/**
 * Set device ID in cookie
 */
export const setDeviceId = (deviceId) => {
    // Set cookie with 1 year expiration
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    document.cookie = `${DEVICE_ID_COOKIE_NAME}=${deviceId}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
};

/**
 * Get device ID from localStorage
 */
export const getDeviceIdFromStorage = () => {
    return localStorage.getItem('userId') || localStorage.getItem('deviceId');
};

/**
 * Set device ID in localStorage
 */
export const setDeviceIdInStorage = (deviceId) => {
    localStorage.setItem('userId', deviceId);
    localStorage.setItem('deviceId', deviceId); // Keep for backward compatibility
};

/**
 * Initialize device ID - get from backend and set cookie and localStorage
 * This should be called when the app loads
 */
export const initializeDeviceId = async () => {
    try {
        // Check if device ID already exists in localStorage first
        let deviceId = getDeviceIdFromStorage();
        
        // If not in localStorage, check cookie
        if (!deviceId) {
            deviceId = getDeviceId();
        }
        
        // If still not found, get or create from backend
        if (!deviceId) {
            // Get or create device ID from backend
            const response = await apiClient.get('/api/device-id');
            deviceId = response.data.device_id;
            
            // Set cookie (backend also sets it, but we set it here too for consistency)
            setDeviceId(deviceId);
        }
        
        // Always store in localStorage for getUserOrders to use
        setDeviceIdInStorage(deviceId);
        
        return deviceId;
    } catch (error) {
        console.error('Error initializing device ID:', error);
        // Generate a fallback device ID if backend fails
        const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setDeviceId(fallbackId);
        setDeviceIdInStorage(fallbackId);
        return fallbackId;
    }
};

