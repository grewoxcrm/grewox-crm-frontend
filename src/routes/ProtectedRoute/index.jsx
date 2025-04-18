import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsLogin } from '../../auth/services/authSlice';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useSelector(selectIsLogin);
    const location = useLocation();
    if (!isAuthenticated) {
        if (location.pathname === '/login') {
            return children;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (location.pathname === '/login' && isAuthenticated) {
        return <Navigate to="/auth-redirect" replace />;
    }

    return children;
};

export default ProtectedRoute; 