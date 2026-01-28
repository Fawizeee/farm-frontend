import axios from 'axios';

// Create an axios instance with default config
// Set REACT_APP_API_URL in your .env file
const baseURL = 'https://farm-backend-eta.vercel.app';
console.log('API Client initialized with baseURL:', baseURL);

const apiClient = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies in requests
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
    (config) => {
        // Get token from local storage (or your state management)
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // If data is FormData, remove Content-Type header to let browser set it with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        // Debug logging
        console.log('API Request:', config.method?.toUpperCase(), config.url, 'Full URL:', config.baseURL + config.url);

        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            // Clear local storage and redirect to login if necessary
            localStorage.removeItem('authToken');

            // Only redirect if not already on admin login page
            const currentPath = window.location.pathname;
            if (currentPath !== '/admin') {
                window.location.href = '/login'; // Redirect regular users to login
            }
            // If on /admin, don't redirect - let the admin login page handle the error
        }

        // Enhanced error logging
        if (error.response) {
            // Server responded with error status
            console.error('API Error Response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                data: error.response.data
            });
        } else if (error.request) {
            // Request was made but no response received
            console.error('API Network Error:', {
                message: error.message,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                code: error.code
            });
        } else {
            // Something else happened
            console.error('API Error:', error.message);
        }

        // Handle generic errors or transform them
        const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
        console.error('API Error Message:', errorMessage);

        return Promise.reject(error);
    }
);

export default apiClient;
