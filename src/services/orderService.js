import apiClient from './apiClient';

const ORDERS_ENDPOINT = '/api/orders';

export const createOrder = async (orderData) => {
    // The apiClient interceptor will handle FormData automatically
    const response = await apiClient.post(ORDERS_ENDPOINT, orderData);
    return response.data;
};

export const getOrders = async (statusFilter = null, date = null, search = null) => {
    const params = {};
    if (statusFilter) {
        params.status_filter = statusFilter;
    }
    if (date) {
        params.date = date; // Format: YYYY-MM-DD
    }
    if (search) {
        params.search = search;
    }
    
    const response = await apiClient.get(ORDERS_ENDPOINT, { params });
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await apiClient.get(`${ORDERS_ENDPOINT}/${id}`);
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await apiClient.put(`${ORDERS_ENDPOINT}/${id}`, { status });
    return response.data;
};

export const deleteOrder = async (id) => {
    const response = await apiClient.delete(`${ORDERS_ENDPOINT}/${id}`);
    return response.data;
};

export const getUserOrders = async (statusFilter = null) => {
    // Get user ID from localStorage
    const userId = localStorage.getItem('userId') || localStorage.getItem('deviceId');
    
    const params = {};
    if (userId) {
        params.user_id = userId;
    }
    if (statusFilter) {
        params.status_filter = statusFilter;
    }
    
    const response = await apiClient.get('/api/orders/user/orders', { params });
    return response.data;
};

