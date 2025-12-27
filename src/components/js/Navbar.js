import React, { useState, useEffect, useRef } from 'react';
import '../css/Navbar.css';
import { FaBars, FaHome, FaShoppingCart, FaPhone, FaInfoCircle } from 'react-icons/fa';
import { NavLink, Link } from 'react-router-dom';

function Navbar({ cartCount }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMouseEnter = () => {
        // Only use hover on desktop (non-touch devices)
        if (window.innerWidth > 768) {
            setIsMenuOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (window.innerWidth > 768) {
            setIsMenuOpen(false);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <span className="logo-text">Mufu Farm</span>
                </Link>

                <div
                    ref={dropdownRef}
                    className="navbar-dropdown"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <button
                        className="dropdown-toggle"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        <span className="menu-icon"><FaBars /></span>
                        Menu
                        {cartCount > 0 && (
                            <span className="nav-cart-badge">{cartCount}</span>
                        )}
                    </button>

                    {isMenuOpen && (
                        <div className="dropdown-menu">
                            <NavLink
                                to="/"
                                className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                <span className="dropdown-icon"><FaHome /></span>
                                Home
                            </NavLink>
                            <NavLink
                                to="/about"
                                className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                <span className="dropdown-icon"><FaInfoCircle /></span>
                                About
                            </NavLink>
                            <NavLink
                                to="/order"
                                className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                <span className="dropdown-icon"><FaShoppingCart /></span>
                                Order
                                {cartCount > 0 && (
                                    <span className="dropdown-badge">{cartCount}</span>
                                )}
                            </NavLink>
                            <NavLink
                                to="/contact"
                                className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                <span className="dropdown-icon"><FaPhone /></span>
                                Contact Us
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
