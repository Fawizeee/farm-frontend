import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaImage, FaSave } from 'react-icons/fa';
import '../css/AddProduct.css';
import { createProduct, updateProduct, getProductById } from '../../services/productService';

const AddProduct = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const productId = searchParams.get('id');
    const isEditMode = !!productId;
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        unit: 'kg',
        icon: '',
        available: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (isEditMode && productId) {
                try {
                    setFetching(true);
                    const product = await getProductById(parseInt(productId));
                    setFormData({
                        name: product.name || '',
                        description: product.description || '',
                        price: product.price?.toString() || '',
                        unit: product.unit || 'kg',
                        icon: product.icon || '',
                        available: product.available !== undefined ? product.available : true
                    });
                    // Set image preview if image_url exists
                    if (product.image_url) {
                        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                        setImagePreview(`${apiUrl}${product.image_url}`);
                    } else {
                        setImagePreview(null);
                    }
                    setImageFile(null);
                } catch (error) {
                    console.error('Error fetching product:', error);
                    setError('Failed to load product. Please try again.');
                } finally {
                    setFetching(false);
                }
            }
        };

        fetchProduct();
    }, [isEditMode, productId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB.');
                return;
            }
            
            setImageFile(file);
            setError('');
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate price
            const price = parseFloat(formData.price);
            if (isNaN(price) || price <= 0) {
                setError('Please enter a valid price');
                setLoading(false);
                return;
            }

            // Prepare product data
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: price,
                unit: formData.unit,
                icon: formData.icon.trim() || '🐟', // Default icon if none provided
                available: formData.available
            };

            if (isEditMode) {
                await updateProduct(parseInt(productId), productData, imageFile);
                setSuccess(true);
                setTimeout(() => {
                    navigate('/admin/products/edit');
                }, 2000);
            } else {
                await createProduct(productData, imageFile);
                setSuccess(true);
                
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    unit: 'kg',
                    icon: '',
                    available: true
                });
                setImageFile(null);
                setImagePreview(null);
                const fileInput = document.getElementById('image');
                if (fileInput) {
                    fileInput.value = '';
                }

                // Show success message and redirect after 2 seconds
                setTimeout(() => {
                    navigate('/admin/home');
                }, 2000);
            }

        } catch (err) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} product:`, err);
            setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} product. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-product-container">
            {/* Header */}
            <header className="add-product-header">
                <button className="back-btn" onClick={() => navigate(isEditMode ? '/admin/products/edit' : '/admin/home')}>
                    <FaArrowLeft /> Back {isEditMode ? 'to Products' : 'to Dashboard'}
                </button>
                <h1 className="page-title">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            </header>

            {/* Form Container */}
            <div className="form-container">
                <div className="form-card">
                    {fetching ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Loading product...</div>
                    ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Product Name */}
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                Product Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                placeholder="e.g., Fresh Catfish"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label htmlFor="description" className="form-label">
                                Description <span className="required">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-textarea"
                                placeholder="Describe your product..."
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                required
                            />
                        </div>

                        {/* Price and Unit Row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="price" className="form-label">
                                    Price (₦) <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    className="form-input"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="unit" className="form-label">
                                    Unit <span className="required">*</span>
                                </label>
                                <select
                                    id="unit"
                                    name="unit"
                                    className="form-input"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="piece">Piece</option>
                                    <option value="dozen">Dozen</option>
                                    <option value="bag">Bag</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Image Upload */}
                        <div className="form-group">
                            <label htmlFor="image" className="form-label">
                                <FaImage style={{ marginRight: '8px' }} />
                                Product Image
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                className="form-input"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handleImageChange}
                            />
                            <small className="form-hint">
                                Upload a product image (JPEG, PNG, GIF, or WebP, max 5MB). If not provided, the icon/emoji will be displayed instead.
                            </small>
                            
                            {/* Image Preview */}
                            {imagePreview && (
                                <div style={{ marginTop: '15px', position: 'relative', display: 'inline-block' }}>
                                    <img 
                                        src={imagePreview} 
                                        alt="Product preview" 
                                        style={{ 
                                            maxWidth: '200px', 
                                            maxHeight: '200px', 
                                            borderRadius: '8px',
                                            border: '2px solid #ddd',
                                            objectFit: 'cover'
                                        }} 
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            background: 'rgba(255, 0, 0, 0.7)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '25px',
                                            height: '25px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                        }}
                                        title="Remove image"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Icon/Emoji */}
                        <div className="form-group">
                            <label htmlFor="icon" className="form-label">
                                Product Icon/Emoji (Fallback)
                            </label>
                            <input
                                type="text"
                                id="icon"
                                name="icon"
                                className="form-input"
                                placeholder="Enter emoji or icon (e.g., 🐟, 🐠, 🦈)"
                                value={formData.icon}
                                onChange={handleChange}
                            />
                            <small className="form-hint">
                                Used as fallback if image URL is not provided or fails to load. Leave empty to use default fish icon (🐟)
                            </small>
                        </div>

                        {/* Availability Checkbox */}
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="available"
                                    checked={formData.available}
                                    onChange={handleChange}
                                />
                                <span>Product is available for sale</span>
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="success-message">
                                Product {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => navigate(isEditMode ? '/admin/products/edit' : '/admin/home')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading || fetching}
                            >
                                {isEditMode ? (
                                    <>
                                        <FaSave style={{ marginRight: '8px' }} />
                                        {loading ? 'Updating...' : 'Update Product'}
                                    </>
                                ) : (
                                    <>
                                        <FaPlus style={{ marginRight: '8px' }} />
                                        {loading ? 'Creating...' : 'Create Product'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProduct;

