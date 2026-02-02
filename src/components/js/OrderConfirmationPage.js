import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyPayment } from '../../services/paymentService';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import '../css/OrderConfirmationPage.css';

function OrderConfirmationPage({ setCart }) {
    const [searchParams] = useSearchParams();
    // const navigate = useNavigate();
    const reference = searchParams.get('reference');
    const [status, setStatus] = useState('verifying'); // verifying, success, failed
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        if (!reference) {
            setStatus('failed');
            setMessage('No payment reference found.');
            return;
        }

        let attempts = 0;
        const maxAttempts = 5;

        const verify = async () => {
            try {
                attempts++;
                const response = await verifyPayment(reference);

                if (response.status) {
                    setStatus('success');
                    setMessage('Payment confirmed! Your order is being processed.');
                    // Clear cart upon successful payment verification
                    if (setCart) {
                        setCart([]);
                    }
                } else {
                    // If failed and we have retries left, wait and retry
                    if (attempts < maxAttempts) {
                        console.log(`Verification attempt ${attempts} failed, retrying...`);
                        setTimeout(verify, 2000);
                    } else {
                        setStatus('failed');
                        setMessage(response.message || 'Payment verification failed.');
                    }
                }
            } catch (error) {
                console.error('Verification error:', error);

                // If error and we have retries left, wait and retry
                if (attempts < maxAttempts) {
                    console.log(`Verification attempt ${attempts} error, retrying...`);
                    setTimeout(verify, 2000);
                } else {
                    setStatus('failed');
                    setMessage('An error occurred while verifying payment.');
                }
            }
        };

        verify();
    }, [reference]);

    return (
        <div className="confirmation-page">
            <div className="confirmation-card">
                {status === 'verifying' && (
                    <>
                        <div className="icon-container verifying">
                            <FaHourglassHalf className="spin" />
                        </div>
                        <h2>Verifying Payment</h2>
                        <p>{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="icon-container success">
                            <FaCheckCircle />
                        </div>
                        <h2>Payment Successful!</h2>
                        <p>{message}</p>
                        <div className="confirmation-actions">
                            <Link to="/order" className="action-btn primary">
                                View My Orders
                            </Link>
                            <Link to="/" className="action-btn secondary">
                                Back to Home
                            </Link>
                        </div>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="icon-container failed">
                            <FaTimesCircle />
                        </div>
                        <h2>Payment Failed</h2>
                        <p>{message}</p>
                        <div className="confirmation-actions">
                            <Link to="/order" className="action-btn primary">
                                Try Again
                            </Link>
                            <Link to="/" className="action-btn secondary">
                                Back to Home
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default OrderConfirmationPage;
