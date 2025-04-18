import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Sidebar from './sidebar';
import Footer from './footer';
import './layout.scss';
import { useGetRolesQuery } from '../module/hrm/role/services/roleApi';
import { selectCurrentUser } from '../../auth/services/authSlice';
import { useSelector } from 'react-redux';

const DashboardLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: rolesData, isLoading: isLoadingRoles, refetch } = useGetRolesQuery({
        skip: !loggedInUser // Skip query if user not logged in
    });

    // Find user's role data
    const userRoleData = rolesData?.data?.find(role => role.id === loggedInUser?.role_id);
    
    // Parse permissions if they exist
    const userPermissions = userRoleData?.permissions ? JSON.parse(userRoleData.permissions) : null;

  

    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
        localStorage.setItem('dashboard_sidebar_collapsed', JSON.stringify(collapsed));
    };

    useEffect(() => {
        const savedState = localStorage.getItem('dashboard_sidebar_collapsed');
        if (savedState !== null) {
            setSidebarCollapsed(JSON.parse(savedState));
        }
    }, []);

    // Fetch roles when user logs in
    useEffect(() => {
        if (loggedInUser) {
            refetch();
        }
    }, [loggedInUser, refetch]);

    return (
        <div className="dashboard-layout">
            <Sidebar
                collapsed={sidebarCollapsed}
                onCollapsedChange={handleSidebarToggle}
                userPermissions={userPermissions}
                rolesData={rolesData}
                loggedInUser={loggedInUser}
            />
            <div className="main-content">
                <Header />
                <div className="page-content">
                    <Outlet />
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default DashboardLayout;