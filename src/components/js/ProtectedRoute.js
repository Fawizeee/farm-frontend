import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';

const ProtectedRoute = ({ children }) => {
    const isAuth = isAuthenticated();
    const location = useLocation();

    if (!isAuth) {
        // Redirect them to the /admin login page, but save the current location they were
        // trying to go to. This allows us to send them back to that page after they login,
        // which is a nicer user experience than just sending them to the home page.
        return <Navigate to="/admin" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
