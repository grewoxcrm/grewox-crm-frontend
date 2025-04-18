import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsLogin } from '../../auth/services/authSlice';
import { Spin, Result } from 'antd';

const RoleBasedRoute = ({ children }) => {
    const userRole = useSelector(selectUserRole);
    const isLogin = useSelector(selectIsLogin);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAndRedirect = () => {
            if (!isLogin) {
                localStorage.removeItem('persist:root');
                navigate('/login', { state: { from: location }, replace: true });
                return;
            }

            if (userRole) {
                const isSuperAdmin = userRole === 'super-admin';
                const isInSuperAdminPath = location.pathname.startsWith('/superadmin');
                const isInRegularDashboardPath = location.pathname.startsWith('/dashboard');

                // Redirect based on role
                if (isSuperAdmin && !isInSuperAdminPath && location.pathname !== '/auth-redirect') {
                    navigate('/superadmin', { replace: true });
                } else if (!isSuperAdmin && !isInRegularDashboardPath && location.pathname !== '/auth-redirect') {
                    navigate('/dashboard', { replace: true });
                }
            }
        };

        checkAndRedirect();
    }, [isLogin, userRole, location.pathname]);

    if (!isLogin) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f0f2f5'
            }}>
                <Result
                    status="403"
                    title="Not Authenticated"
                    subTitle="Please log in to access this page"
                    extra={
                        <Spin size="large" />
                    }
                />
            </div>
        );
    }

    // Show error if no role is assigned
    if (!userRole) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f0f2f5'
            }}>
                <Result
                    status="error"
                    title="No Role Assigned"
                    subTitle="You don't have any role assigned. Please contact your administrator."
                />
            </div>
        );
    }

    return children;
};

export default RoleBasedRoute;