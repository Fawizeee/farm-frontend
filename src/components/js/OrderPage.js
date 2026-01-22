import React, { useState, useEffect, useMemo } from 'react';
import '../css/OrderPage.css';
import CartModal from './CartModal';
import { GiFishBucket, GiFire, GiWaterDrop } from 'react-icons/gi';
import { FaArrowLeft, FaShoppingCart, FaClipboardList, FaHourglass } from 'react-icons/fa';
import { MdRestaurantMenu } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { getUserOrders } from '../../services/orderService';
import apiClient from '../../services/apiClient';

// Get API base URL for constructing full image URLs
const API_BASE_URL = apiClient.defaults.baseURL;

const ProductIcon = ({ type }) => {
    switch (type) {
        case 'fish-small':
            return <GiFishBucket className="product-svg-icon small" />;
        case 'fish-medium':
            return <GiFishBucket className="product-svg-icon medium" />;
        case 'fish-large':
            return <GiFishBucket className="product-svg-icon large" />;
        case 'fillet':
            return <MdRestaurantMenu className="product-svg-icon fillet" />;
        case 'smoked':
            return <GiFire className="product-svg-icon smoked" />;
        case 'live':
            return <GiWaterDrop className="product-svg-icon live" />;
        default:
            return <GiFishBucket className="product-svg-icon" />;
    }
};

function OrderPage({ cart, setCart, pendingOrders: localPendingOrders, addPendingOrder }) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [fishProducts, setFishProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dbPendingOrders, setDbPendingOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);


    useEffect(() => {
        document.title = 'Order - Mufu Catfish Farm';
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const products = await getProducts();
                setFishProducts(products);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchPendingOrders = async () => {
            try {
                setLoadingOrders(true);
                // Fetch all orders from database (no status filter)
                const orders = await getUserOrders();
                // Format orders to match the expected structure
                const formattedOrders = orders.map(order => ({
                    id: order.id,
                    date: new Date(order.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    items: order.order_items || [],
                    total: order.total_amount,
                    customerName: order.customer_name,
                    customerPhone: order.customer_phone,
                    deliveryAddress: order.delivery_address || null,
                    status: order.status
                }));
                setDbPendingOrders(formattedOrders);
            } catch (err) {
                console.error('Error fetching orders:', err);
                // Don't show error to user, just log it
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchPendingOrders();
    }, []);

    // Combine local pending orders (from current session) with database orders
    // Remove duplicates based on order ID
    const allPendingOrders = useMemo(() => {
        const combined = [...localPendingOrders, ...dbPendingOrders];
        // Show all orders regardless of status
        const unique = combined.filter((order, index, self) =>
            index === self.findIndex(o => o.id === order.id)
        );
        return unique.sort((a, b) => {
            // Sort by ID descending (newest first)
            return (b.id || 0) - (a.id || 0);
        });
    }, [localPendingOrders, dbPendingOrders]);

    // Get only pending orders for the "Check Order" button
    const pendingOrdersOnly = useMemo(() => {
        return allPendingOrders.filter(order => order.status === 'pending');
    }, [allPendingOrders]);

    const getQuantity = (productId) => {
        const item = cart.find(item => item.id === productId);
        return item ? item.quantity : 0;
    };

    const addToCart = (product) => {
        if (!product.available) return;
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productId);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(item =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prevCart.filter(item => item.id !== productId);
        });
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const scrollToPendingOrders = () => {
        const pendingSection = document.getElementById('pending-orders');
        if (pendingSection) {
            pendingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="order-page">
            <header className="order-header">
                <Link to="/" className="back-button" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    <FaArrowLeft /> Back
                </Link>
                <h1>Order Fresh Fish</h1>
                {pendingOrdersOnly.length > 0 && (
                    <button
                        className="check-order-btn"
                        onClick={scrollToPendingOrders}
                    >
                        Check Order
                        <span className="check-order-badge">{pendingOrdersOnly.length}</span>
                    </button>
                )}
            </header>

            <div className="catalogue-container">
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
                        Loading products...
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c', fontSize: '18px' }}>
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="catalogue-grid">
                        {fishProducts.map(product => (
                            <div
                                key={product.id}
                                className={`catalogue-card ${!product.available ? 'unavailable' : ''}`}
                            >
                                <div className="catalogue-image">
                                    <span className={`availability-badge ${product.available ? 'available' : 'unavailable'}`}>
                                        {product.available ? 'Available' : 'Unavailable'}
                                    </span>
                                    {product.image_url ? (
                                        <>
                                            <img
                                                src={`${API_BASE_URL}${product.image_url}`}
                                                alt={product.name}
                                                className="product-image"
                                                onError={(e) => {
                                                    // Fallback to icon/emoji if image fails to load
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.parentElement.querySelector('.product-icon-container');
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                            <div className="product-icon-container" style={{ display: 'none' }}>
                                                {product.icon && /[\u{1F300}-\u{1F9FF}]/u.test(product.icon) ? (
                                                    <span className="product-emoji">{product.icon}</span>
                                                ) : (
                                                    <ProductIcon type={product.icon} />
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="product-icon-container">
                                            {product.icon && /[\u{1F300}-\u{1F9FF}]/u.test(product.icon) ? (
                                                <span className="product-emoji">{product.icon}</span>
                                            ) : (
                                                <ProductIcon type={product.icon} />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="catalogue-info">
                                    <h3 className="catalogue-name">{product.name}</h3>
                                    <p className="catalogue-description">{product.description}</p>
                                    <div className="catalogue-price">
                                        ₦{product.price.toLocaleString()} / {product.unit}
                                    </div>
                                    <div className="quantity-controls">
                                        <button
                                            className="quantity-btn subtract"
                                            onClick={() => removeFromCart(product.id)}
                                            disabled={!product.available || getQuantity(product.id) === 0}
                                        >
                                            −
                                        </button>
                                        <span className="quantity-display">
                                            {product.available ? `${getQuantity(product.id)} ${product.unit}` : 'N/A'}
                                        </span>
                                        <button
                                            className="quantity-btn add"
                                            onClick={() => addToCart(product)}
                                            disabled={!product.available}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Orders Box */}
            <div id="pending-orders" className={`pending-orders-box ${allPendingOrders.length === 0 && !loadingOrders ? 'empty' : ''}`}>
                {loadingOrders ? (
                    <div className="no-pending-orders">
                        <span className="no-orders-icon"><FaHourglass /></span>
                        <h3>Loading Orders...</h3>
                    </div>
                ) : allPendingOrders.length > 0 ? (
                    <>
                        <div className="pending-orders-header">
                            <span className="pending-icon"><FaHourglass /></span>
                            <h3>My Orders</h3>
                            <span className="pending-count">{allPendingOrders.length}</span>
                        </div>
                        <div className="pending-orders-list">
                            {allPendingOrders.map((order, index) => (
                                <div key={order.id || index} className="pending-order-item">
                                    <div className="pending-order-info">
                                        <span className="pending-order-id">Order #{order.id}</span>
                                        <span className="pending-order-date">{order.date}</span>
                                    </div>
                                    <div className="pending-order-details">
                                        <span className="pending-order-items">
                                            {order.items && order.items.length > 0
                                                ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                                                : 'No items'}
                                        </span>
                                        <span className="pending-order-total">
                                            ₦{order.total ? order.total.toLocaleString() : '0'}
                                        </span>
                                    </div>
                                    <div className="pending-order-status">
                                        <span className={`status-badge status-${order.status || 'pending'}`}>
                                            {order.status === 'pending' ? 'Awaiting Confirmation' :
                                                order.status === 'confirmed' ? 'Confirmed' :
                                                    order.status === 'processing' ? 'Processing' :
                                                        order.status === 'completed' ? 'Completed' :
                                                            order.status === 'cancelled' ? 'Cancelled' :
                                                                'Awaiting Confirmation'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="no-pending-orders">
                        <span className="no-orders-icon"><FaClipboardList /></span>
                        <h3>No Orders</h3>
                        <p>Your order history will appear here</p>
                    </div>
                )}
            </div>

            {/* Floating Cart Button */}
            {getTotalItems() > 0 && (
                <button className="floating-cart" onClick={() => setIsCartOpen(true)}>
                    <span className="cart-icon"><FaShoppingCart /></span>
                    <span className="cart-badge">{getTotalItems()}</span>
                    <span className="cart-total">₦{getTotalPrice().toLocaleString()}</span>
                </button>
            )}

            {/* Cart Modal */}
            {isCartOpen && (
                <CartModal
                    cart={cart}
                    setCart={setCart}
                    onClose={() => setIsCartOpen(false)}
                    totalPrice={getTotalPrice()}
                    addPendingOrder={addPendingOrder}
                />
            )}
        </div>
    );
}

export default OrderPage;
