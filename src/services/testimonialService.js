import apiClient from './apiClient';

const TESTIMONIALS_ENDPOINT = '/api/testimonials';

export const getTestimonials = async (activeOnly = true) => {
    const response = await apiClient.get(TESTIMONIALS_ENDPOINT, {
        params: { active_only: activeOnly }
    });
    return response.data;
};

export const createTestimonial = async (testimonialData) => {
    const response = await apiClient.post(TESTIMONIALS_ENDPOINT, testimonialData);
    return response.data;
};

export const updateTestimonial = async (id, testimonialData) => {
    const response = await apiClient.put(`${TESTIMONIALS_ENDPOINT}/${id}`, testimonialData);
    return response.data;
};

export const deleteTestimonial = async (id) => {
    const response = await apiClient.delete(`${TESTIMONIALS_ENDPOINT}/${id}`);
    return response.data;
};

