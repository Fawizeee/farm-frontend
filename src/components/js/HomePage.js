import React from 'react';
import { GiFishBucket } from 'react-icons/gi';
import { FaTruck, FaTags } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Testimonials from './Testimonials';
import '../css/App.css';

function HomePage() {
    return (
        <>
            <section id="home" className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-container">
                    <h1 className="hero-title">Fresh Catfish, Farm to Table</h1>
                    <p className="hero-subtitle">
                        Premium quality catfish raised with care at Mufu Farm.
                        Experience the finest freshwater fish.
                    </p>
                    <Link
                        to="/order"
                        className="hero-button"
                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        Order Now
                    </Link>
                </div>
            </section>

            <section className="features-section">
                <div className="features-container">
                    <div className="feature-card">
                        <span className="feature-icon"><GiFishBucket /></span>
                        <h3>Fresh Quality</h3>
                        <p>Farm-raised catfish harvested daily for maximum freshness</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon"><FaTruck /></span>
                        <h3>Delivery</h3>
                        <p>Coming Soon - Delivery service will be available shortly</p>
                    </div>
                    <div className="feature-card">
                        <span className="feature-icon"><FaTags /></span>
                        <h3>Best Prices</h3>
                        <p>Direct from farm pricing with no middleman markup</p>
                    </div>
                </div>
            </section>

            <Testimonials />
        </>
    );
}

export default HomePage;
