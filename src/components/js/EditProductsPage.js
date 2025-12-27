import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaBox, FaSpinner } from 'react-icons/fa';
import '../css/EditProductsPage.css';
import { getProducts, deleteProduct } from '../../services/productService';

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
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading products...</div>
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
                                                <span>{product.icon || '🐟'}</span>
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
                                                <span>{product.icon || '🐟'}</span>
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

