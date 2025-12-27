import React, { useState } from 'react';
import { FaUser, FaLock, FaSignInAlt, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../css/AdminLogin.css';
import { login } from '../../services/authService';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(credentials.username, credentials.password);
            navigate('/admin/home');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <h2>Admin Portal</h2>
                <p>Welcome back, please login to continue.</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaUser className="icon" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                    </div>
                    <div className="input-group">
                        <FaLock className="icon" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {error && (
                        <div className="error-message">
                            <FaExclamationCircle />
                            {error}
                        </div>
                    )}
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'} {!loading && <FaSignInAlt />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
