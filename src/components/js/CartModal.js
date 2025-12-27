import React, { useState } from 'react';
import '../css/CartModal.css';
import { FaCheck, FaCheckCircle } from 'react-icons/fa';
import { createOrder } from '../../services/orderService';
import { getDeviceId } from '../../utils/deviceCookie';

function CartModal({ cart, setCart, onClose, totalPrice, addPendingOrder }) {
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentProof, setPaymentProof] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPaymentProof(file);
        }
    };

    const updateQuantity = (productId, change) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.id === productId) {
                    const newQuantity = item.quantity + change;
                    if (newQuantity <= 0) return null;
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean);
        });
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Get device ID from cookie
            const deviceId = getDeviceId();
            
            // Prepare FormData for file upload
            const formData = new FormData();
            formData.append('customer_name', customerName);
            formData.append('customer_phone', customerPhone);
            formData.append('delivery_address', deliveryAddress || '');
            formData.append('items', JSON.stringify(cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }))));
            
            if (deviceId) {
                formData.append('device_id', deviceId);
            }
            
            // Append file if selected
            if (paymentProof) {
                formData.append('payment_proof', paymentProof);
            }

            // Submit order to backend
            const createdOrder = await createOrder(formData);

            // Format order for local state
            const newOrder = {
                id: createdOrder.id,
                date: new Date(createdOrder.created_at).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                items: cart,
                total: createdOrder.total_amount,
                customerName: createdOrder.customer_name,
                customerPhone: createdOrder.customer_phone,
                deliveryAddress: createdOrder.delivery_address,
                status: createdOrder.status
            };

            addPendingOrder(newOrder);
            setOrderComplete(true);

            // Clear cart after successful order
            setTimeout(() => {
                setCart([]);
                onClose();
            }, 3000);
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to submit order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="modal-overlay">
                <div className="modal-content success-modal">
                    <div className="success-icon"><FaCheckCircle /></div>
                    <h2>Order Submitted!</h2>
                    <p>Thank you for your order. We will verify your payment and contact you shortly.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{showCheckout ? 'Checkout' : 'Your Cart'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {!showCheckout ? (
                    <>
                        <div className="cart-items">
                            {cart.length === 0 ? (
                                <p className="empty-cart">Your cart is empty</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item-info">
                                            <h4>{item.name}</h4>
                                            <p>₦{item.price.toLocaleString()} / {item.unit}</p>
                                        </div>
                                        <div className="cart-item-controls">
                                            <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                        </div>
                                        <div className="cart-item-total">
                                            ₦{(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="cart-footer">
                                <div className="cart-total-row">
                                    <span>Total:</span>
                                    <span className="total-amount">₦{totalPrice.toLocaleString()}</span>
                                </div>
                                <button
                                    className="checkout-btn"
                                    onClick={() => setShowCheckout(true)}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <form className="checkout-form" onSubmit={handleSubmitOrder}>
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            {cart.map(item => (
                                <div key={item.id} className="summary-item">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="summary-total">
                                <span>Total:</span>
                                <span>₦{totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="payment-info">
                            <h3>Payment Details</h3>
                            <div className="bank-details">
                                <div className="bank-row">
                                    <span className="bank-label">Bank Name:</span>
                                    <span className="bank-value">Access Bank</span>
                                </div>
                                <div className="bank-row">
                                    <span className="bank-label">Account Number:</span>
                                    <span className="bank-value account-number">0123456789</span>
                                </div>
                                <div className="bank-row">
                                    <span className="bank-label">Account Name:</span>
                                    <span className="bank-value">Mufu Catfish Farm</span>
                                </div>
                            </div>
                            <p className="payment-note">
                                Please transfer the exact amount and upload proof of payment below.
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Your Name *</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="Enter your phone number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Delivery Address</label>
                            <textarea
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Coming Soon - Delivery service will be available shortly"
                                rows="3"
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                            <small style={{ color: '#666', fontStyle: 'italic' }}>Delivery service coming soon</small>
                        </div>

                        <div className="form-group">
                            <label>Upload Payment Proof *</label>
                            <div className="file-upload">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileUpload}
                                    id="payment-proof"
                                    required
                                />
                                <label htmlFor="payment-proof" className="file-upload-label">
                                    {paymentProof ? (
                                        <span className="file-selected"><FaCheck /> {paymentProof.name}</span>
                                    ) : (
                                        <span>Click to upload receipt or screenshot</span>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="checkout-actions">
                            <button
                                type="button"
                                className="back-to-cart-btn"
                                onClick={() => setShowCheckout(false)}
                            >
                                ← Back to Cart
                            </button>
                            <button
                                type="submit"
                                className="submit-order-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Order'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default CartModal;
