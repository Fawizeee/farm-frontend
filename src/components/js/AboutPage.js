import React from 'react';
import '../css/AboutPage.css';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function AboutPage() {
    React.useEffect(() => {
        document.title = 'About Us - Mufu Catfish Farm';
    }, []);

    return (
        <div className="about-page">
            <header className="about-header">
                <Link to="/" className="back-button" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    <FaArrowLeft /> Back
                </Link>
                <h1>About Us</h1>
                <div className="header-spacer"></div>
            </header>

            <div className="about-content">
                <section className="about-section">
                    <h2>Our Story</h2>
                    <p>
                        Established in 2020, Mufu Catfish Farm began with a simple mission: to provide the freshest,
                        highest-quality catfish to families and businesses in Lagos and beyond. What started as a small
                        pond in a backyard has grown into a fully functional aquaculture facility, driven by passion
                        and a commitment to excellence.
                    </p>
                    <p>
                        We believe that great food starts with great ingredients. That's why we take extra care in raising
                        our fish, ensuring they grow in clean, healthy environments without harmful chemicals. Our dedication
                        to sustainable farming practices not only ensures better taste but also contributes to a healthier
                        ecosystem.
                    </p>
                </section>

                <section className="about-section">
                    <h2>Our Values</h2>
                    <div className="about-grid">
                        <div className="value-card">
                            <h3>Quality First</h3>
                            <p>We never compromise on the quality of our fish. Freshness and hygiene are our top priorities.</p>
                        </div>
                        <div className="value-card">
                            <h3>Integrity</h3>
                            <p>We believe in honest pricing and transparent practices. what you see is what you get.</p>
                        </div>
                        <div className="value-card">
                            <h3>Community</h3>
                            <p>We are proud to support our local community by creating jobs and sourcing locally.</p>
                        </div>
                        <div className="value-card">
                            <h3>Innovation</h3>
                            <p>We continuously learn and improve our farming techniques to bring you the best produce.</p>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <h2>Why Choose Us?</h2>
                    <p>
                        At Mufu Farm, we handle the entire process from hatching to harvest. This allows us to maintain strict
                        quality control at every stage. Whether you need fresh live catfish, smoked catfish for your soups,
                        or oven-ready fillets, we guarantee satisfaction in every order.
                    </p>
                </section>
            </div>
        </div>
    );
}

export default AboutPage;
