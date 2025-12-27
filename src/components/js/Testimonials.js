import React, { useRef, useState, useEffect } from 'react';
import '../css/Testimonials.css';
import { FaQuoteLeft, FaUser, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getTestimonials } from '../../services/testimonialService';

function Testimonials() {
    const sliderRef = useRef(null);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setLoading(true);
                const data = await getTestimonials(true);
                setTestimonials(data);
            } catch (err) {
                console.error('Error fetching testimonials:', err);
                // Fallback to default testimonials on error
                setTestimonials([
                    {
                        id: 1,
                        name: "Adebayo Johnson",
                        role: "Restaurant Owner",
                        text: "The catfish from Mufu Farm is consistently the best. My customers always compliment the freshness and taste. Highly recommended!",
                        rating: 5
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    const scrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -350, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 350, behavior: 'smooth' });
        }
    };

    return (
        <section className="testimonials-section">
            <div className="testimonials-header">
                <h2>What Our Customers Say</h2>
                <p>Don't just take our word for it</p>
            </div>

            <div className="testimonials-container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading testimonials...</div>
                ) : (
                    <>
                <div className="testimonials-slider" ref={sliderRef}>
                    {testimonials.map(item => (
                        <div key={item.id} className="testimonial-card">
                            <div className="testimonial-rating">
                                {[...Array(item.rating)].map((_, i) => (
                                    <span key={i}>★</span>
                                ))}
                            </div>
                            <div className="quote-icon" style={{ opacity: 0.1, marginBottom: '-20px' }}>
                                <FaQuoteLeft size={30} />
                            </div>
                            <p className="testimonial-text">{item.text}</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">
                                    <FaUser />
                                </div>
                                <div className="author-info">
                                    <h4>{item.name}</h4>
                                    <p>{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="scroll-controls">
                    <button className="scroll-btn" onClick={scrollLeft} aria-label="Scroll left">
                        <FaChevronLeft />
                    </button>
                    <button className="scroll-btn" onClick={scrollRight} aria-label="Scroll right">
                        <FaChevronRight />
                    </button>
                </div>
                    </>
                )}
            </div>
        </section>
    );
}

export default Testimonials;
