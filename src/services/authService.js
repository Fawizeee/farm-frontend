import apiClient from './apiClient';

export const login = async (username, password) => {
    try {
        const response = await apiClient.post('/api/admin/login', { username, password });
        if (response.data.access_token) {
            localStorage.setItem('authToken', response.data.access_token);
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('authToken');
};

export const getCurrentAdmin = async () => {
    try {
        const response = await apiClient.get('/api/admin/me');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
};
