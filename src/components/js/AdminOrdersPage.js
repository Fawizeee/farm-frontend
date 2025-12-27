import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClipboardList, FaCheck, FaTimes, FaSpinner, FaReceipt, FaTimesCircle, FaSearch, FaCalendar } from 'react-icons/fa';
import '../css/AdminOrdersPage.css';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import apiClient from '../../services/apiClient';

const AdminOrdersPage = ({ orders: propOrders = [] }) => {
    const [orders, setOrders] = useState(propOrders);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState(() => {
        // Default to today's date in YYYY-MM-DD format
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // Fetch orders for selected date, with search if provided
                const ordersData = await getOrders(null, selectedDate, searchQuery || null);
                setOrders(ordersData);
            } catch (error) {
                console.error('Error fetching orders:', error);
                if (error.response?.status === 401) {
                    navigate('/admin');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate, selectedDate, searchQuery]); // Refetch when date or search changes

    const normalizeStatus = (status) => {
        if (!status) return 'pending';
        return String(status).toLowerCase().trim();
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdating(prev => ({ ...prev, [orderId]: true }));
            await updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        } finally {
            setUpdating(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const handleApprove = (order) => {
        const normalizedStatus = normalizeStatus(order.status);
        let newStatus = 'confirmed';
        
        // Determine next status based on current status
        if (normalizedStatus === 'pending') {
            newStatus = 'confirmed';
        } else if (normalizedStatus === 'confirmed') {
            newStatus = 'processing';
        } else if (normalizedStatus === 'processing') {
            newStatus = 'completed';
        } else if (normalizedStatus === 'cancelled') {
            newStatus = 'confirmed'; // Re-activate cancelled order
        } else if (normalizedStatus === 'completed') {
            // Already completed, reset to confirmed
            newStatus = 'confirmed';
        }
        
        handleStatusChange(order.id, newStatus);
    };

    const handleDecline = (order) => {
        handleStatusChange(order.id, 'cancelled');
    };

    const getStatusBadgeClass = (status) => {
        const normalizedStatus = normalizeStatus(status);
        const statusMap = {
            'pending': 'status-pending',
            'confirmed': 'status-confirmed',
            'processing': 'status-processing',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled'
        };
        return statusMap[normalizedStatus] || 'status-pending';
    };

    const getStatusLabel = (status) => {
        const normalizedStatus = normalizeStatus(status);
        const labelMap = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'processing': 'Processing',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return labelMap[normalizedStatus] || status;
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
    };

    const closeOrderModal = () => {
        setSelectedOrder(null);
    };

    const getPaymentProofUrl = (paymentProofUrl) => {
        if (!paymentProofUrl) return null;
        // If it's already a full URL, return it
        if (paymentProofUrl.startsWith('http')) {
            return paymentProofUrl;
        }
        // Otherwise, prepend the API base URL
        const baseURL = apiClient.defaults.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:8000';
        return `${baseURL}${paymentProofUrl}`;
    };

    // No client-side filtering - we're now filtering on the server
    const sortedOrders = orders;

    return (
        <div className="admin-orders-container">
            <div className="admin-orders-header">
                <div>
                    <Link to="/admin/home" className="back-link">
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                </div>
                <h1>All Orders</h1>
                <div style={{ width: '100px' }}></div> {/* Spacer */}
            </div>

            <div className="orders-search-container">
                <div className="search-filters-row">
                    <div className="date-filter-wrapper">
                        <FaCalendar className="date-icon" />
                        <input
                            type="date"
                            className="date-picker-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    
                    <div className="search-bar-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            className="orders-search-input"
                            placeholder="Search by Order ID (e.g., 123 or #123)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="search-clear-btn"
                                onClick={() => setSearchQuery('')}
                                title="Clear search"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>
                
                {(searchQuery || selectedDate) && (
                    <div className="search-results-info">
                        {orders.length === 0 ? (
                            <span>
                                {searchQuery 
                                    ? `No orders found matching "${searchQuery}"` 
                                    : `No orders found for ${new Date(selectedDate).toLocaleDateString()}`}
                            </span>
                        ) : (
                            <span>
                                Found {orders.length} order{orders.length !== 1 ? 's' : ''}
                                {selectedDate && ` for ${new Date(selectedDate).toLocaleDateString()}`}
                                {searchQuery && ` matching "${searchQuery}"`}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="orders-table-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</div>
                ) : sortedOrders.length > 0 ? (
                    <>
                        {/* Desktop Table View */}
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedOrders.map((order, index) => (
                                    <tr 
                                        key={order.id || index}
                                        className="order-row-clickable"
                                        onClick={() => handleOrderClick(order)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className="order-id">#{order.id}</td>
                                        <td>{new Date(order.created_at).toLocaleString()}</td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{order.customer_name || 'N/A'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                                {order.customer_phone}
                                            </div>
                                        </td>
                                        <td>
                                            {order.order_items && order.order_items.length > 0 ? (
                                                <>
                                                    {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                                        {order.order_items.map(i => i.product_name).join(', ')}
                                                    </div>
                                                </>
                                            ) : (
                                                <span style={{ color: '#999' }}>No items</span>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: '600' }}>₦{order.total_amount ? order.total_amount.toLocaleString() : '0'}</td>
                                        <td>
                                            <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="order-actions">
                                                <button
                                                    className="btn-confirm"
                                                    onClick={() => handleApprove(order)}
                                                    disabled={updating[order.id]}
                                                    title="Approve Order"
                                                >
                                                    {updating[order.id] ? (
                                                        <FaSpinner className="spinning" />
                                                    ) : (
                                                        <FaCheck />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn-decline"
                                                    onClick={() => handleDecline(order)}
                                                    disabled={updating[order.id]}
                                                    title="Decline Order"
                                                >
                                                    {updating[order.id] ? (
                                                        <FaSpinner className="spinning" />
                                                    ) : (
                                                        <FaTimes />
                                                    )}
                                                    Decline
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Card View - Customer Only */}
                        <div className="orders-mobile-view">
                            {sortedOrders.map((order, index) => (
                                <div 
                                    key={order.id || index} 
                                    className="order-card-mobile order-row-clickable"
                                    onClick={() => handleOrderClick(order)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="order-card-header">
                                        <div className="order-card-customer">
                                            <div className="customer-name">{order.customer_name || 'N/A'}</div>
                                            <div className="customer-phone">{order.customer_phone}</div>
                                        </div>
                                        <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <div className="order-card-actions">
                                        <button
                                            className="btn-confirm"
                                            onClick={() => handleApprove(order)}
                                            disabled={updating[order.id]}
                                            title="Approve Order"
                                        >
                                            {updating[order.id] ? (
                                                <FaSpinner className="spinning" />
                                            ) : (
                                                <FaCheck />
                                            )}
                                            Approve
                                        </button>
                                        <button
                                            className="btn-decline"
                                            onClick={() => handleDecline(order)}
                                            disabled={updating[order.id]}
                                            title="Decline Order"
                                        >
                                            {updating[order.id] ? (
                                                <FaSpinner className="spinning" />
                                            ) : (
                                                <FaTimes />
                                            )}
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="empty-orders">
                        <FaClipboardList />
                        <h3>No orders found</h3>
                        <p>Orders submitted by customers will appear here.</p>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="order-modal-overlay" onClick={closeOrderModal}>
                    <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="order-modal-header">
                            <h2>Order Details #{selectedOrder.id}</h2>
                            <button className="order-modal-close" onClick={closeOrderModal}>
                                <FaTimesCircle />
                            </button>
                        </div>
                        
                        <div className="order-modal-body">
                            <div className="order-detail-section">
                                <h3>Customer Information</h3>
                                <div className="order-detail-row">
                                    <span className="detail-label">Name:</span>
                                    <span className="detail-value">{selectedOrder.customer_name}</span>
                                </div>
                                <div className="order-detail-row">
                                    <span className="detail-label">Phone:</span>
                                    <span className="detail-value">{selectedOrder.customer_phone}</span>
                                </div>
                                <div className="order-detail-row">
                                    <span className="detail-label">Delivery Address:</span>
                                    <span className="detail-value">{selectedOrder.delivery_address || 'Coming Soon'}</span>
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h3>Order Items</h3>
                                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                                    <div className="order-items-list">
                                        {selectedOrder.order_items.map((item, idx) => (
                                            <div key={idx} className="order-item-detail">
                                                <div className="order-item-info">
                                                    <span className="item-name">{item.product_name}</span>
                                                    <span className="item-quantity">× {item.quantity}</span>
                                                </div>
                                                <div className="order-item-price">
                                                    ₦{item.subtotal?.toLocaleString() || '0'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No items found</p>
                                )}
                                <div className="order-total-row">
                                    <span className="total-label">Total Amount:</span>
                                    <span className="total-amount">₦{selectedOrder.total_amount?.toLocaleString() || '0'}</span>
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h3>Payment Proof</h3>
                                {selectedOrder.payment_proof_url ? (
                                    <div className="payment-proof-container">
                                        <img 
                                            src={getPaymentProofUrl(selectedOrder.payment_proof_url)} 
                                            alt="Payment Proof" 
                                            className="payment-proof-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <div className="payment-proof-error" style={{ display: 'none' }}>
                                            <FaReceipt />
                                            <p>Unable to load image</p>
                                            <a 
                                                href={getPaymentProofUrl(selectedOrder.payment_proof_url)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="payment-proof-link"
                                            >
                                                Open in new tab
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="no-payment-proof">No payment proof uploaded</p>
                                )}
                            </div>

                            <div className="order-detail-section">
                                <h3>Order Status</h3>
                                <div className="order-status-display">
                                    <span className={`order-status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                                        {getStatusLabel(selectedOrder.status)}
                                    </span>
                                    <span className="order-date">
                                        Ordered on {new Date(selectedOrder.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="order-modal-footer">
                            <button
                                className="btn-confirm"
                                onClick={() => {
                                    handleApprove(selectedOrder);
                                    closeOrderModal();
                                }}
                                disabled={updating[selectedOrder.id]}
                            >
                                {updating[selectedOrder.id] ? (
                                    <FaSpinner className="spinning" />
                                ) : (
                                    <FaCheck />
                                )}
                                Approve
                            </button>
                            <button
                                className="btn-decline"
                                onClick={() => {
                                    handleDecline(selectedOrder);
                                    closeOrderModal();
                                }}
                                disabled={updating[selectedOrder.id]}
                            >
                                {updating[selectedOrder.id] ? (
                                    <FaSpinner className="spinning" />
                                ) : (
                                    <FaTimes />
                                )}
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
