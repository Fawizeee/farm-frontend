import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartLine, FaUsers, FaMousePointer, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../css/NotificationAnalyticsPage.css';
import { getNotificationAnalytics, getNotificationDetailAnalytics } from '../../services/adminService';
import { logout } from '../../services/authService';

const NotificationAnalyticsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const data = await getNotificationAnalytics();
                setNotifications(data);
            } catch (error) {
                console.error('Error fetching notification analytics:', error);
                if (error.response?.status === 401) {
                    logout();
                    navigate('/admin');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [navigate]);

    const handleViewDetails = async (notificationId) => {
        try {
            setDetailLoading(true);
            const detail = await getNotificationDetailAnalytics(notificationId);
            setSelectedNotification(detail);
        } catch (error) {
            console.error('Error fetching notification details:', error);
            alert('Failed to load notification details');
        } finally {
            setDetailLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="analytics-container">
                <div className="analytics-loading">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <button className="back-button" onClick={() => navigate('/admin/home')}>
                    <FaArrowLeft /> Back to Dashboard
                </button>
                <h1 className="analytics-title">
                    <FaChartLine /> Notification Analytics
                </h1>
            </div>

            {selectedNotification ? (
                <div className="analytics-detail-view">
                    <button 
                        className="back-to-list-btn" 
                        onClick={() => setSelectedNotification(null)}
                    >
                        <FaArrowLeft /> Back to List
                    </button>
                    
                    {detailLoading ? (
                        <div className="loading">Loading details...</div>
                    ) : (
                        <div className="detail-content">
                            <div className="detail-header">
                                <h2>{selectedNotification.notification.title}</h2>
                                <p className="detail-message">{selectedNotification.notification.message}</p>
                                <p className="detail-date">
                                    Sent on {formatDate(selectedNotification.notification.created_at)}
                                </p>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon sent">
                                        <FaUsers />
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-label">People Reached</div>
                                        <div className="stat-value">{selectedNotification.total_recipients}</div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon clicked">
                                        <FaMousePointer />
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-label">Clicks</div>
                                        <div className="stat-value">{selectedNotification.clicked_count}</div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon rate">
                                        <FaChartLine />
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-label">Click Rate</div>
                                        <div className="stat-value">{selectedNotification.click_rate}%</div>
                                    </div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon failed">
                                        <FaTimesCircle />
                                    </div>
                                    <div className="stat-info">
                                        <div className="stat-label">Failed</div>
                                        <div className="stat-value">{selectedNotification.notification.failed_count}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="recipients-section">
                                <h3>Recipients ({selectedNotification.recipients.length})</h3>
                                <div className="recipients-list">
                                    {selectedNotification.recipients.map((recipient, index) => (
                                        <div key={index} className="recipient-item">
                                            <div className="recipient-info">
                                                <div className="recipient-id">
                                                    Device: {recipient.device_id.substring(0, 20)}...
                                                </div>
                                                <div className="recipient-date">
                                                    Sent: {formatDate(recipient.sent_at)}
                                                </div>
                                            </div>
                                            <div className="recipient-status">
                                                {recipient.is_clicked ? (
                                                    <span className="status-badge clicked">
                                                        <FaCheckCircle /> Clicked
                                                        {recipient.clicked_at && (
                                                            <span className="click-time">
                                                                {' '}on {formatDate(recipient.clicked_at)}
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="status-badge not-clicked">
                                                        Not Clicked
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="analytics-list-view">
                    {notifications.length === 0 ? (
                        <div className="empty-state">
                            <FaChartLine size={48} />
                            <h3>No notifications sent yet</h3>
                            <p>Send your first notification to see analytics here</p>
                        </div>
                    ) : (
                        <>
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <div className="summary-label">Total Notifications</div>
                                    <div className="summary-value">{notifications.length}</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-label">Total Reached</div>
                                    <div className="summary-value">
                                        {notifications.reduce((sum, n) => sum + n.sent_count, 0)}
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-label">Total Clicks</div>
                                    <div className="summary-value">
                                        {notifications.reduce((sum, n) => sum + n.clicked_count, 0)}
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-label">Avg. Click Rate</div>
                                    <div className="summary-value">
                                        {notifications.length > 0
                                            ? (
                                                (notifications.reduce((sum, n) => {
                                                    const rate = n.sent_count > 0 
                                                        ? (n.clicked_count / n.sent_count * 100) 
                                                        : 0;
                                                    return sum + rate;
                                                }, 0) / notifications.length)
                                            ).toFixed(1)
                                            : '0.0'
                                        }%
                                    </div>
                                </div>
                            </div>

                            <div className="notifications-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Sent Date</th>
                                            <th>Reached</th>
                                            <th>Clicks</th>
                                            <th>Click Rate</th>
                                            <th>Failed</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.map((notification) => {
                                            const clickRate = notification.sent_count > 0
                                                ? ((notification.clicked_count / notification.sent_count) * 100).toFixed(1)
                                                : '0.0';

                                            return (
                                                <tr key={notification.id}>
                                                    <td className="notification-title-cell">
                                                        <div className="title-text">{notification.title}</div>
                                                        <div className="title-preview">{notification.message.substring(0, 50)}...</div>
                                                    </td>
                                                    <td>{formatShortDate(notification.created_at)}</td>
                                                    <td>
                                                        <span className="metric-value">{notification.sent_count}</span>
                                                    </td>
                                                    <td>
                                                        <span className="metric-value clicks">{notification.clicked_count}</span>
                                                    </td>
                                                    <td>
                                                        <span className="metric-value rate">{clickRate}%</span>
                                                    </td>
                                                    <td>
                                                        <span className="metric-value failed">{notification.failed_count}</span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="view-details-btn"
                                                            onClick={() => handleViewDetails(notification.id)}
                                                            disabled={detailLoading}
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationAnalyticsPage;

