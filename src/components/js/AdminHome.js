import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignOutAlt, FaChartPie, FaBell, FaBox, FaInfoCircle, FaChartLine } from 'react-icons/fa';
import '../css/AdminHome.css';
import { getDashboardStats, sendNotification } from '../../services/adminService';
import { getOrders } from '../../services/orderService';
import { logout } from '../../services/authService';
import NotificationPermissionModal from './NotificationPermissionModal';
import AdminNotificationAccessModal from './AdminNotificationAccessModal';
import { getFCMToken, saveAdminTokenToBackend } from '../../services/notificationService';

const AdminHome = ({ orders: propOrders = [] }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState(propOrders);
    const [loading, setLoading] = useState(true);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [statsData, ordersData] = await Promise.all([
                    getDashboardStats(),
                    getOrders()
                ]);
                setStats(statsData);
                setOrders(ordersData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                if (error.response?.status === 401) {
                    navigate('/admin');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    // Register admin notification token when component loads
    useEffect(() => {
        const registerAdminToken = async () => {
            // Only register if notification permission is granted
            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    const token = await getFCMToken();
                    if (token) {
                        await saveAdminTokenToBackend(token);
                        console.log('Admin notification token registered');
                    }
                } catch (error) {
                    console.warn('Failed to register admin notification token:', error);
                    // Don't show error to user, just log it
                }
            }
        };

        registerAdminToken();
    }, []);

    // Check notification permission when switching to notifications tab
    useEffect(() => {
        if (activeTab === 'notifications') {
            // Check if notification permission is not granted and not denied
            if ('Notification' in window && Notification.permission === 'default') {
                // Check if modal was dismissed recently (within 24 hours)
                const dismissedTime = localStorage.getItem('notificationModalDismissedTime');
                const now = Date.now();
                const dayInMs = 24 * 60 * 60 * 1000;

                if (!dismissedTime || (now - parseInt(dismissedTime)) > dayInMs) {
                    setShowNotificationModal(true);
                }
            }
        }
    }, [activeTab]);

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    // Get recent orders (last 5)
    const recentOrders = orders.slice(0, 5);

    const DashboardView = () => {
        if (loading) {
            return <div style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard...</div>;
        }

        return (
            <div className="dashboard-grid">
                {/* Statistics Overview */}
                {stats && (
                    <>
                        <div className="dashboard-card clickable-card" onClick={() => navigate('/admin/orders')}>
                            <div className="card-header">
                                <h3 className="card-title"><FaBox /> Orders</h3>
                            </div>
                            <div className="card-content">
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '16px' }}>
                                    {stats.total_orders}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '16px' }}>
                                    Total Orders • {stats.pending_orders} pending
                                </div>
                                {recentOrders.length > 0 ? (
                                    <>
                                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#667085', marginBottom: '8px', fontWeight: '600' }}>Recent Orders</div>
                                            {recentOrders.map((order, index) => (
                                                <div className="stat-item" key={order.id || index}>
                                                    <span className="stat-label">
                                                        #{order.id} <span style={{ fontSize: '0.75rem', color: '#999' }}>
                                                            ({new Date(order.created_at).toLocaleDateString()})
                                                        </span>
                                                    </span>
                                                    <span className="stat-value">₦{order.total_amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state" style={{ padding: '12px 0', marginTop: '16px', borderTop: '1px solid #eee' }}>
                                        <p style={{ fontSize: '0.9rem' }}>No recent orders</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3 className="card-title">Total Revenue</h3>
                            </div>
                            <div className="card-content">
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#12b76a' }}>
                                    ₦{stats.total_revenue.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                                    From {stats.completed_orders} completed orders
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <div className="card-header">
                                <h3 className="card-title">Products</h3>
                            </div>
                            <div className="card-content">
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed' }}>
                                    {stats.active_products}/{stats.total_products}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px', marginBottom: '16px' }}>
                                    Active products
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate('/admin/products/add')}
                                        style={{ flex: '1', minWidth: '100px', fontSize: '0.9rem', padding: '8px 16px' }}
                                    >
                                        Add
                                    </button>
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate('/admin/products/edit')}
                                        style={{ flex: '1', minWidth: '100px', fontSize: '0.9rem', padding: '8px 16px' }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Info Page Container */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title"><FaInfoCircle /> Farm Info</h3>
                        <span className="card-action">Edit</span>
                    </div>
                    <div className="card-content">
                        <div className="stat-item">
                            <span className="stat-label">Status</span>
                            <span className="stat-value success" style={{ color: '#12b76a' }}>Operational</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Next Harvest</span>
                            <span className="stat-value">Dec 24, 2025</span>
                        </div>
                    </div>
                </div>

                {/* Notification Container */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title"><FaBell /> Recent Alerts</h3>
                        <span className="card-action">Clear</span>
                    </div>
                    <div className="card-content">
                        <div className="empty-state">
                            <p>No new alerts</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const NotificationsView = () => {
        const [notification, setNotification] = useState({ title: '', message: '' });
        const [showSuccess, setShowSuccess] = useState(false);
        const [showError, setShowError] = useState(false);
        const [errorMessage, setErrorMessage] = useState('');
        const [sending, setSending] = useState(false);
        const [result, setResult] = useState(null);

        const handleSend = async (e) => {
            e.preventDefault();
            
            // Check if notification permission is not granted
            if ('Notification' in window && Notification.permission !== 'granted') {
                setShowAccessDeniedModal(true);
                return;
            }
            
            setSending(true);
            setShowSuccess(false);
            setShowError(false);
            setResult(null);

            try {
                const response = await sendNotification(notification.title, notification.message);
                setResult(response);
                setShowSuccess(true);
                setNotification({ title: '', message: '' });
                setTimeout(() => {
                    setShowSuccess(false);
                    setResult(null);
                }, 5000);
            } catch (error) {
                console.error('Error sending notification:', error);
                let errorMsg = 'Failed to send notification. Please try again.';

                if (error.response?.status === 403 || error.response?.status === 401) {
                    errorMsg = 'Authentication failed. Please log out and log in again.';
                    // Optionally redirect to login after a delay
                    setTimeout(() => {
                        logout();
                        navigate('/admin');
                    }, 3000);
                } else if (error.response?.status === 503) {
                    errorMsg = error.response?.data?.detail || 'Firebase is not configured. Please check backend setup.';
                } else if (error.response?.data?.detail) {
                    errorMsg = error.response.data.detail;
                }

                setErrorMessage(errorMsg);
                setShowError(true);
                setTimeout(() => setShowError(false), 5000);
            } finally {
                setSending(false);
            }
        };

        return (
            <div className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Notification Permission Status Banner */}
                {'Notification' in window && Notification.permission === 'denied' && (
                    <div style={{
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px',
                        color: '#856404'
                    }}>
                        <strong>⚠️ Notification Permission Denied</strong>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>
                            You have blocked notifications. To receive notifications, please enable them in your browser settings.
                        </p>
                    </div>
                )}
                {'Notification' in window && Notification.permission === 'granted' && (
                    <div style={{
                        backgroundColor: '#d1f2eb',
                        border: '1px solid #12b76a',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px',
                        color: '#0f5132'
                    }}>
                        <strong>✅ Notifications Enabled</strong>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>
                            You will receive notifications from users who have subscribed.
                        </p>
                    </div>
                )
                }

                <div className="card-header">
                    <h3 className="card-title">Send Broadcast Notification</h3>
                </div>
                <div className="card-content">
                    <form className="notification-form-container" onSubmit={handleSend}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="title">Notification Title</label>
                            <input
                                id="title"
                                type="text"
                                className="form-input"
                                placeholder="e.g. New Harvest Arrival!"
                                value={notification.title}
                                onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="message">Message Content</label>
                            <textarea
                                id="message"
                                className="form-textarea"
                                placeholder="Type your message here..."
                                value={notification.message}
                                onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={sending}>
                                <FaBell className="btn-icon" />
                                {sending ? 'Sending...' : 'Send Notification'}
                            </button>
                        </div>

                        {showSuccess && result && (
                            <div className="notification-success">
                                <strong>Success!</strong> Notification sent to {result.sent_count} device(s).
                                {result.failed_count > 0 && (
                                    <span style={{ display: 'block', marginTop: '8px', fontSize: '0.9rem' }}>
                                        {result.failed_count} device(s) failed to receive the notification.
                                    </span>
                                )}
                            </div>
                        )}

                        {showError && (
                            <div className="notification-error" style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: '#fee2e2',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                color: '#991b1b'
                            }}>
                                <strong>Error:</strong> {errorMessage}
                            </div>
                        )}
                    </form>
                </div>
            </div >
        );
    };

    return (
        <div className="admin-home-container">
            {/* Top Header */}
            <header className="admin-header">
                <div className="admin-brand">
                    Mufu Farm Admin
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                </button>
            </header>

            {/* Navigation Bar */}
            <nav className="admin-nav">
                <div
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <FaChartPie style={{ marginRight: '8px' }} /> Dashboard
                </div>
                <div
                    className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <FaBell style={{ marginRight: '8px' }} /> Notifications
                </div>
                <Link to="/admin/notifications/analytics" className="nav-item" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    <FaChartLine style={{ marginRight: '8px' }} /> Analytics
                </Link>
            </nav>

            {/* Main Content */}
            <main className="admin-content">
                {activeTab === 'dashboard' ? <DashboardView /> : <NotificationsView />}
            </main>

            {/* Notification Permission Modal */}
            {showNotificationModal && (
                <NotificationPermissionModal
                    onClose={() => setShowNotificationModal(false)}
                    onPermissionGranted={async () => {
                        setShowNotificationModal(false);
                        console.log('Notification permission granted from admin modal');
                        // Register admin token after permission is granted
                        try {
                            const token = await getFCMToken();
                            if (token) {
                                await saveAdminTokenToBackend(token);
                                console.log('Admin notification token registered after permission granted');
                            }
                        } catch (error) {
                            console.warn('Failed to register admin notification token:', error);
                        }
                    }}
                />
            )}

            {/* Admin Notification Access Denied Modal */}
            {showAccessDeniedModal && (
                <AdminNotificationAccessModal
                    onClose={() => setShowAccessDeniedModal(false)}
                />
            )}
        </div>
    );
};

export default AdminHome;
