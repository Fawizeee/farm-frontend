import apiClient from './apiClient';

export const initializePayment = async (data) => {
    try {
        const response = await apiClient.post('/api/payment/initialize', data);
        return response.data;
    } catch (error) {
        console.error('Error initializing payment:', error);
        throw error;
    }
};

export const verifyPayment = async (reference) => {
    try {
        const response = await apiClient.get(`/api/payment/verify/${reference}`);
        return response.data;
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
};
