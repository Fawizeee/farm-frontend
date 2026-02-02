import React, { useState, useEffect } from 'react';
import Skeleton from './Skeleton';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaBox, FaSpinner } from 'react-icons/fa';
import '../css/EditProductsPage.css';
import { getProducts, deleteProduct } from '../../services/productService';
import apiClient from '../../services/apiClient';

const API_BASE_URL = apiClient.defaults.baseURL;

const EditProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const productsData = await getProducts();
                setProducts(productsData);
            } catch (error) {
                console.error('Error fetching products:', error);
                if (error.response?.status === 401) {
                    navigate('/admin');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [navigate]);

    const handleDelete = async (productId, e) => {
        e.stopPropagation(); // Prevent navigation when clicking delete button

        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleting(prev => ({ ...prev, [productId]: true }));
            await deleteProduct(productId);
            setProducts(products.filter(p => p.id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        } finally {
            setDeleting(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/admin/products/add?id=${productId}`);
    };

    return (
        <div className="edit-products-container">
            <div className="edit-products-header">
                <div>
                    <Link to="/admin/home" className="back-link">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                </div>
                <h1>Edit Products</h1>
                <div style={{ width: '100px' }}></div> {/* Spacer */}
            </div>

            <div className="products-table-container">
                {loading ? (
                    <>
                        {/* Desktop Skeleton */}
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Unit</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <tr key={n}>
                                        <td><Skeleton type="text" width="40px" /></td>
                                        <td><Skeleton type="text" width="120px" /></td>
                                        <td><Skeleton type="text" width="200px" /></td>
                                        <td><Skeleton type="text" width="80px" /></td>
                                        <td><Skeleton type="text" width="40px" /></td>
                                        <td><Skeleton type="rect" height="24px" width="100px" style={{ borderRadius: '12px' }} /></td>
                                        <td><Skeleton type="rect" height="32px" width="80px" style={{ borderRadius: '6px' }} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Skeleton */}
                        <div className="products-mobile-view">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="product-card-mobile">
                                    <div className="product-card-header" style={{ marginBottom: '10px' }}>
                                        <div className="product-card-info" style={{ flex: 1 }}>
                                            <Skeleton type="text" width="100px" style={{ marginBottom: '5px' }} />
                                            <Skeleton type="text" width="60px" />
                                        </div>
                                        <Skeleton type="rect" height="24px" width="80px" style={{ borderRadius: '12px' }} />
                                    </div>
                                    <div className="product-description-mobile" style={{ marginBottom: '15px' }}>
                                        <Skeleton type="text" width="90%" />
                                        <Skeleton type="text" width="70%" />
                                    </div>
                                    <div className="product-card-actions">
                                        <Skeleton type="rect" height="36px" width="100%" style={{ borderRadius: '6px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : products.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Unit</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        onClick={() => handleProductClick(product.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className="product-id">#{product.id}</td>
                                        <td>
                                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url.startsWith('http') ? product.image_url : `${API_BASE_URL}${product.image_url}`}
                                                        alt={product.name}
                                                        className="edit-product-img"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'inline';
                                                        }}
                                                    />
                                                ) : null}
                                                <span className="edit-product-emoji" style={{ display: product.image_url ? 'none' : 'inline' }}>{product.icon || '🐟'}</span>
                                                {product.name}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {product.description}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>₦{product.price ? product.price.toLocaleString() : '0'}</td>
                                        <td>{product.unit || 'kg'}</td>
                                        <td>
                                            <span className={`product-status-badge ${product.available ? 'status-available' : 'status-unavailable'}`}>
                                                {product.available ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="btn-delete"
                                                    onClick={(e) => handleDelete(product.id, e)}
                                                    disabled={deleting[product.id]}
                                                    title="Delete Product"
                                                >
                                                    {deleting[product.id] ? (
                                                        <FaSpinner className="spinning" />
                                                    ) : (
                                                        <FaTrash />
                                                    )}
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Card View */}
                        <div className="products-mobile-view">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="product-card-mobile"
                                    onClick={() => handleProductClick(product.id)}
                                >
                                    <div className="product-card-header">
                                        <div className="product-card-info">
                                            <div className="product-name">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url.startsWith('http') ? product.image_url : `${API_BASE_URL}${product.image_url}`}
                                                        alt={product.name}
                                                        className="edit-product-img-mobile"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'inline';
                                                        }}
                                                    />
                                                ) : null}
                                                <span className="edit-product-emoji-mobile" style={{ display: product.image_url ? 'none' : 'inline' }}>{product.icon || '🐟'}</span>
                                                {product.name}
                                            </div>
                                            <div className="product-price">₦{product.price ? product.price.toLocaleString() : '0'} / {product.unit || 'kg'}</div>
                                        </div>
                                        <span className={`product-status-badge ${product.available ? 'status-available' : 'status-unavailable'}`}>
                                            {product.available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    <div className="product-description-mobile">
                                        {product.description}
                                    </div>
                                    <div className="product-card-actions">
                                        <button
                                            className="btn-delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(product.id, e);
                                            }}
                                            disabled={deleting[product.id]}
                                            title="Delete Product"
                                        >
                                            {deleting[product.id] ? (
                                                <FaSpinner className="spinning" />
                                            ) : (
                                                <FaTrash />
                                            )}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="empty-products">
                        <FaBox />
                        <h3>No products found</h3>
                        <p>Add your first product to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditProductsPage;

