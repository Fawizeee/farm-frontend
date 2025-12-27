import React, { useState } from 'react';
import '../css/ContactPage.css';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { submitContactForm } from '../../services/contactService';

function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await submitContactForm(formData);
            setSuccess(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            console.error('Error submitting contact form:', err);
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="location-page">
            <header className="location-header">
                <Link to="/" className="back-button" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    <FaArrowLeft /> Back
                </Link>
                <h1>Contact Us</h1>
                <div className="header-spacer"></div>
            </header>

            <div className="location-content">
                <div className="location-card">
                    <div className="location-map">
                        <iframe
                            title="Mufu Farm Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.0!2d3.4!3d6.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzAnMDAuMCJOIDPCsDI0JzAwLjAiRQ!5e0!3m2!1sen!2sng!4v1234567890"
                            width="100%"
                            height="300"
                            style={{ border: 0, borderRadius: '12px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>

                    <div className="location-details">
                        <div className="detail-item">
                            <span className="detail-icon"><FaMapMarkerAlt /></span>
                            <div className="detail-info">
                                <h3>Address</h3>
                                <p>Mufu Catfish Farm<br />
                                    123 Farm Road, Ikorodu<br />
                                    Lagos State, Nigeria</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <span className="detail-icon"><FaPhone /></span>
                            <div className="detail-info">
                                <h3>Phone</h3>
                                <p>+234 801 234 5678</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <span className="detail-icon"><FaEnvelope /></span>
                            <div className="detail-info">
                                <h3>Email</h3>
                                <p>info@mufufarm.com</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <span className="detail-icon"><FaClock /></span>
                            <div className="detail-info">
                                <h3>Hours</h3>
                                <p>Monday - Saturday: 7:00 AM - 6:00 PM<br />
                                    Sunday: 8:00 AM - 4:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="directions-card">
                    <h2>How to Find Us</h2>
                    <div className="directions-content">
                        <p>
                            Located in the heart of Ikorodu, our farm is easily accessible
                            from the main Lagos-Ikorodu expressway. Follow the signs to
                            Farm Road and you'll find us about 2km down on the right side.
                        </p>
                        <div className="landmarks">
                            <h4>Nearby Landmarks:</h4>
                            <ul>
                                <li>Ikorodu Town Hall - 1.5km away</li>
                                <li>Lagos State Polytechnic - 3km away</li>
                                <li>Ikorodu BRT Terminal - 2km away</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="directions-card">
                    <h2>Send Us a Message</h2>
                    {success && (
                        <div style={{ 
                            padding: '15px', 
                            backgroundColor: '#d4edda', 
                            color: '#155724', 
                            borderRadius: '8px', 
                            marginBottom: '20px' 
                        }}>
                            Message sent successfully! We'll get back to you soon.
                        </div>
                    )}
                    {error && (
                        <div style={{ 
                            padding: '15px', 
                            backgroundColor: '#f8d7da', 
                            color: '#721c24', 
                            borderRadius: '8px', 
                            marginBottom: '20px' 
                        }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #ddd',
                                    fontSize: '16px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #ddd',
                                    fontSize: '16px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #ddd',
                                    fontSize: '16px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Subject *
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #ddd',
                                    fontSize: '16px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Message *
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #ddd',
                                    fontSize: '16px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                backgroundColor: '#2563eb',
                                color: 'white',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? 'Sending...' : 'Send Message'} {!loading && <FaPaperPlane />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;
