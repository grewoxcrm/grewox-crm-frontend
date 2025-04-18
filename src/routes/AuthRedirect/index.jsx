import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole, selectIsLogin } from '../../auth/services/authSlice';
import { Spin, Result } from 'antd';

const AuthRedirect = () => {
    const navigate = useNavigate();
    const userRole = useSelector(selectUserRole);
    const isLogin = useSelector(selectIsLogin);

    useEffect(() => {
        const redirectBasedOnRole = () => {
            if (!isLogin) {
                localStorage.removeItem('persist:root');
                sessionStorage.clear();
                navigate('/login', { replace: true });
                return;
            }

            if (userRole) {
                const isSuperAdmin = userRole === 'super-admin';
                if (isSuperAdmin) {
                    navigate('/superadmin', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            }
        };

        // Add a small delay to ensure state is properly loaded
        const timer = setTimeout(redirectBasedOnRole, 100);
        return () => clearTimeout(timer);
    }, [userRole, isLogin]);

    // Show loading state while redirecting
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f0f2f5'
        }}>
            <Result
                icon={<Spin size="large" />}
                title="Redirecting..."
                subTitle="Please wait while we redirect you to the appropriate dashboard"
            />
        </div>
    );
};

export default AuthRedirect;
