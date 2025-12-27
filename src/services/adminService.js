import apiClient from './apiClient';

export const getDashboardStats = async () => {
    const response = await apiClient.get('/api/admin/dashboard-stats');
    return response.data;
};

export const getContactMessages = async (unreadOnly = false) => {
    const response = await apiClient.get('/api/contact-messages', {
        params: { unread_only: unreadOnly }
    });
    return response.data;
};

export const markMessageAsRead = async (messageId) => {
    const response = await apiClient.put(`/api/contact-messages/${messageId}/read`);
    return response.data;
};

export const sendNotification = async (title, message) => {
    const response = await apiClient.post('/api/admin/send-notification', {
        title,
        message
    });
    return response.data;
};

export const getNotificationAnalytics = async () => {
    const response = await apiClient.get('/api/admin/notifications/analytics');
    return response.data;
};

export const getNotificationDetailAnalytics = async (notificationId) => {
    const response = await apiClient.get(`/api/admin/notifications/${notificationId}/analytics`);
    return response.data;
};

export const trackNotificationClick = async (notificationId, deviceId) => {
    const response = await apiClient.post('/api/notifications/track-click', {
        notification_id: notificationId,
        device_id: deviceId
    });
    return response.data;
};

