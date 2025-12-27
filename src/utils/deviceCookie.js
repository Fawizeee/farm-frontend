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
 * Initialize device ID - get from backend and set cookie
 * This should be called when the app loads
 */
export const initializeDeviceId = async () => {
    try {
        // Check if device ID already exists in cookie
        let deviceId = getDeviceId();
        
        if (!deviceId) {
            // Get or create device ID from backend
            const response = await apiClient.get('/api/device-id');
            deviceId = response.data.device_id;
            
            // Set cookie (backend also sets it, but we set it here too for consistency)
            setDeviceId(deviceId);
        }
        
        return deviceId;
    } catch (error) {
        console.error('Error initializing device ID:', error);
        // Generate a fallback device ID if backend fails
        const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setDeviceId(fallbackId);
        return fallbackId;
    }
};

