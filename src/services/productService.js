import apiClient from './apiClient';

const PRODUCTS_ENDPOINT = '/api/products';

export const getProducts = async (availableOnly = false) => {
    const response = await apiClient.get(PRODUCTS_ENDPOINT, {
        // params: { available_only: availableOnly }
    });
    return response.data;
};

export const getProductById = async (id) => {
    const response = await apiClient.get(`${PRODUCTS_ENDPOINT}/${id}`);
    return response.data;
};

export const createProduct = async (productData, imageFile = null) => {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('unit', productData.unit || 'kg');
    formData.append('icon', productData.icon || '🐟');
    // Convert boolean to string for FormData
    formData.append('available', String(productData.available !== undefined ? productData.available : true));
    
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    const response = await apiClient.post(PRODUCTS_ENDPOINT, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateProduct = async (id, productData, imageFile = null) => {
    const formData = new FormData();
    
    if (productData.name !== undefined) formData.append('name', productData.name);
    if (productData.description !== undefined) formData.append('description', productData.description);
    if (productData.price !== undefined) formData.append('price', productData.price);
    if (productData.unit !== undefined) formData.append('unit', productData.unit);
    if (productData.icon !== undefined) formData.append('icon', productData.icon);
    if (productData.available !== undefined) {
        // Convert boolean to string for FormData
        formData.append('available', String(productData.available));
    }
    
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    const response = await apiClient.put(`${PRODUCTS_ENDPOINT}/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await apiClient.delete(`${PRODUCTS_ENDPOINT}/${id}`);
    return response.data;
};
