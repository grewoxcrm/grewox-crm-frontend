import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header';
import Sidebar from './sidebar';
import Footer from './footer';
import './layout.scss';

const SuperAdminLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
        localStorage.setItem('superadmin_sidebar_collapsed', JSON.stringify(collapsed));
    };

    useEffect(() => {
        const savedState = localStorage.getItem('superadmin_sidebar_collapsed');
        if (savedState !== null) {
            setSidebarCollapsed(JSON.parse(savedState));
        }
    }, []);

    return (
        <div className="superadmin-layout">
            <Sidebar
                collapsed={sidebarCollapsed}
                onCollapsedChange={handleSidebarToggle}
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

export default SuperAdminLayout; 