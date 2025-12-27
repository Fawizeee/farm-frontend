import apiClient from './apiClient';

export const submitContactForm = async (contactData) => {
    const response = await apiClient.post('/api/contact', contactData);
    return response.data;
};

