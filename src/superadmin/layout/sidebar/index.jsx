import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHome,
    FiSettings,
    FiLogOut,
    FiChevronLeft,
    FiChevronRight,
    FiBriefcase,
    FiPackage,
    FiUsers,
    FiFileText,
    FiShield,
    FiMessageSquare,
    FiUser,
    FiDollarSign,
    FiGlobe,
    FiCreditCard,
    FiEdit3,
    FiBox,
    FiHardDrive
} from 'react-icons/fi';
import { useLogout } from '../../../hooks/useLogout';
import './sidebar.scss';

const Sidebar = ({ collapsed = false, onCollapsedChange = () => { } }) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const handleLogout = useLogout();

    // Sync local state with props
    useEffect(() => {
        setIsCollapsed(collapsed);
    }, [collapsed]);

    // Handle sidebar collapse toggle
    const handleToggleCollapse = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        onCollapsedChange(newCollapsedState);
    };

    const menuItems = [
        {
            title: 'Dashboard',
            icon: <FiHome />,
            path: '/superadmin/dashboard'
        },
        {
            title: 'Company',
            icon: <FiBriefcase />,
            path: '/superadmin/company'
        },
        {
            title: 'Plans',
            icon: <FiBox />,
            path: '/superadmin/plans'
        },
        {
            title: 'Storage',
            icon: <FiHardDrive />,
            path: '/superadmin/storage'
        },
        {
            title: 'Subscribed Users',
            icon: <FiUsers />,
            path: '/superadmin/subscribed-user'
        },
        {
            title: 'Notes',
            icon: <FiFileText />,
            path: '/superadmin/notes'
        },
        {
            title: 'Policy',
            icon: <FiShield />,
            path: '/superadmin/policy'
        },
        {
            title: 'Setting',
            icon: <FiSettings />,
            isDropdown: true,
            subItems: [
                {
                    title: 'Countries',
                    icon: <FiGlobe />,
                    path: '/superadmin/settings/countries'
                },
                {
                    title: 'Currencies',
                    icon: <FiCreditCard />,
                    path: '/superadmin/settings/currencies'
                },
                {
                    title: 'ESignature',
                    icon: <FiEdit3 />,
                    path: '/superadmin/settings/esignature'
                }
            ]
        },
        {
            title: 'Inquiry',
            icon: <FiMessageSquare />,
            path: '/superadmin/inquiry'
        }
    ];

    const renderNavItem = (item) => (
        <NavLink
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
            <div className="nav-item-content">
                <span className="icon">{item.icon}</span>
                {!isCollapsed && <span className="title">{item.title}</span>}
            </div>
        </NavLink>
    );

    const renderSettingsDropdown = (item) => (
        <div className={`nav-dropdown ${isSettingsOpen ? 'open' : ''}`}>
            <div
                className={`nav-item dropdown-trigger ${isSettingsOpen ? 'open' : ''}`}
                onClick={() => !isCollapsed && setIsSettingsOpen(!isSettingsOpen)}
            >
                <div className="nav-item-content">
                    <span className="icon">{item.icon}</span>
                    {!isCollapsed && (
                        <>
                            <span className="title">{item.title}</span>
                            <FiChevronRight className="arrow" />
                        </>
                    )}
                </div>
            </div>
            {!isCollapsed && (
                <motion.div
                    className="dropdown-menu"
                    initial={false}
                    animate={isSettingsOpen ?
                        {
                            opacity: 1,
                            height: 'auto',
                            marginTop: '4px',
                            marginBottom: '4px',
                            y: 0
                        } :
                        {
                            opacity: 0,
                            height: 0,
                            marginTop: 0,
                            marginBottom: 0,
                            y: -5
                        }
                    }
                    transition={{
                        height: {
                            duration: 0.4,
                            ease: [0.4, 0, 0.2, 1]
                        },
                        opacity: {
                            duration: 0.25,
                            ease: "easeInOut"
                        },
                        y: {
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1]
                        },
                        marginTop: {
                            duration: 0.25,
                            ease: "easeInOut"
                        },
                        marginBottom: {
                            duration: 0.25,
                            ease: "easeInOut"
                        }
                    }}
                >
                    {item.subItems.map((subItem, index) => (
                        <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            className={({ isActive }) =>
                                `nav-item sub-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <div className="nav-item-content">
                                <span className="icon">{subItem.icon}</span>
                                <span className="title">{subItem.title}</span>
                            </div>
                        </NavLink>
                    ))}
                </motion.div>
            )}
        </div>
    );

    return (
        <motion.aside
            className={`superadmin-sidebar ${isCollapsed ? 'collapsed' : ''}`}
            initial={false}
        >
            <div className="sidebar-header">
                <div className="logo">
                    {!isCollapsed && <span>SuperAdmin</span>}
                </div>
                <button
                    className="collapse-btn"
                    onClick={handleToggleCollapse}
                >
                    {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <motion.div
                        key={item.path || index}
                        initial={false}
                    >
                        {item.isDropdown ? renderSettingsDropdown(item) : renderNavItem(item)}
                    </motion.div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/superadmin/profile" className="nav-item profile-btn">
                    <div className="nav-item-content">
                        <span className="icon"><FiUser /></span>
                        {!isCollapsed && <span className="title">Profile</span>}
                    </div>
                </NavLink>
                <NavLink
                    to="/logout"
                    onClick={handleLogout}
                    className="nav-item logout-btn"
                >
                    <div className="nav-item-content">
                        <span className="icon">
                            <FiLogOut />
                        </span>
                        {!isCollapsed && <span className="title">Logout</span>}
                    </div>
                </NavLink>
            </div>
        </motion.aside>
    );
};

export default Sidebar;


