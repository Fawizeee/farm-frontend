import React, { useState } from 'react';
import '../css/Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp, FaBell } from 'react-icons/fa';
import NotificationManagementModal from './NotificationManagementModal';

function Footer() {
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Mufu Catfish Farm</h3>
                        <p>Providing the best quality catfish since 2020. Freshness and quality guaranteed.</p>
                    </div>
                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/order">Order Now</a></li>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/contact">Contact</a></li>
                            <li>
                                <button
                                    onClick={() => setIsNotificationModalOpen(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#cbd5e1',
                                        cursor: 'pointer',
                                        padding: 0,
                                        font: 'inherit',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginTop: '8px'
                                    }}
                                    onMouseOver={(e) => e.target.style.color = 'var(--secondary-color)'}
                                    onMouseOut={(e) => e.target.style.color = '#cbd5e1'}
                                >
                                    <FaBell size={14} /> Notifications
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Connect With Us</h3>
                        <div className="social-icons">
                            <a href="https://www.facebook.com" className="social-icon" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                            <a href="https://twitter.com" className="social-icon" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                            <a href="https://www.instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                            <a href="https://wa.me/" className="social-icon" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Mufu Catfish Farm. All rights reserved.</p>
                </div>
            </div>

            {isNotificationModalOpen && (
                <NotificationManagementModal
                    onClose={() => setIsNotificationModalOpen(false)}
                />
            )}
        </footer>
    );
}

export default Footer;
