import React, { useState, useRef, useEffect } from 'react';
import { Input, Badge, Dropdown, Avatar, Tooltip, Space, List, Typography } from 'antd';
import {
    FiBell,
    FiSearch,
    FiUser,
    FiLogOut,
    FiArrowRight
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { useLogout } from '../../../hooks/useLogout';
import { useNavigate } from 'react-router-dom';
import Notifications from '../../../common/notifacations';
import './header.scss';

const { Text } = Typography;

const Header = () => {
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const [showSearch, setShowSearch] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(3);
    const [unreadMails, setUnreadMails] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const user = useSelector(selectCurrentUser);
    const handleLogout = useLogout();
    const navigate = useNavigate();

    // Define searchable items for superadmin
    const searchableItems = [
        // Settings & Configuration
        { title: "System Settings", path: "/superadmin/settings/system", parent: "Settings" },
        { title: "Email Settings", path: "/superadmin/settings/email", parent: "Settings" },
        { title: "Payment Settings", path: "/superadmin/settings/payment", parent: "Settings" },
        { title: "Security Settings", path: "/superadmin/settings/security", parent: "Settings" },

        // User Management
        { title: "All Users", path: "/superadmin/users", parent: "User Management" },
        { title: "Roles & Permissions", path: "/superadmin/roles", parent: "User Management" },
        { title: "User Activity Logs", path: "/superadmin/activity-logs", parent: "User Management" },

        // Organization Management
        { title: "Organizations", path: "/superadmin/organizations", parent: "Organizations" },
        { title: "Organization Types", path: "/superadmin/organization-types", parent: "Organizations" },
        { title: "Subscriptions", path: "/superadmin/subscriptions", parent: "Organizations" },

        // System
        { title: "System Health", path: "/superadmin/system/health", parent: "System" },
        { title: "Backup & Restore", path: "/superadmin/system/backup", parent: "System" },
        { title: "System Logs", path: "/superadmin/system/logs", parent: "System" },
        { title: "Cache Management", path: "/superadmin/system/cache", parent: "System" },

        // Others
        { title: "Profile", path: "/superadmin/profile" },
        { title: "Dashboard", path: "/superadmin" }
    ];

    const searchInputRef = useRef(null);
    const searchResultsRef = useRef(null);

    // Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase().trim();
        setSearchQuery(query);

        // Show results even if query is empty
        let results = searchableItems;

        if (query.length > 0) {
            // Match by title or parent
            results = searchableItems.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.parent?.toLowerCase().includes(query)
            );

            // Sort results
            results.sort((a, b) => {
                // Exact matches first
                const aExactMatch = a.title.toLowerCase() === query;
                const bExactMatch = b.title.toLowerCase() === query;
                if (aExactMatch && !bExactMatch) return -1;
                if (!aExactMatch && bExactMatch) return 1;

                // Then by parent
                if (a.parent && b.parent) {
                    return a.parent.localeCompare(b.parent);
                }
                if (a.parent) return -1;
                if (b.parent) return 1;

                // Finally by title
                return a.title.localeCompare(b.title);
            });
        }

        setSearchResults(results);
        setShowResults(true);
    };

    // Handle search result click
    const handleResultClick = (path) => {
        navigate(path);
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchResultsRef.current && !searchResultsRef.current.contains(event.target) &&
                searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus search input when search is shown
    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);

    const userMenuItems = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <FiUser />,
            onClick: () => navigate('/superadmin/profile')
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <FiLogOut />,
            danger: true,
            onClick: handleLogout
        }
    ];

    return (
        <header className="superadmin-header">
            <div className="header-left">
                <h1>Super Admin</h1>
            </div>

            <div className="header-right">
                <div className="search-container" style={{ display: showSearch ? 'block' : 'none' }}>
                    <Input
                        ref={searchInputRef}
                        prefix={<FiSearch />}
                        placeholder="Search modules..."
                        className="search-input"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onClick={() => setShowResults(true)}
                        onFocus={() => setShowResults(true)}
                        onPressEnter={() => {
                            if (searchResults.length > 0) {
                                handleResultClick(searchResults[0].path);
                            }
                        }}
                    />
                    {showResults && (
                        <div className="search-results" ref={searchResultsRef}>
                            <List
                                size="small"
                                dataSource={searchResults}
                                renderItem={item => (
                                    <List.Item
                                        className="search-result-item"
                                        onClick={() => handleResultClick(item.path)}
                                    >
                                        <div className="search-result-content">
                                            <div className="search-result-title">
                                                <Text strong>{item.title}</Text>
                                                {item.parent && (
                                                    <Text type="secondary">
                                                        in {item.parent}
                                                    </Text>
                                                )}
                                            </div>
                                            <FiArrowRight className="search-result-arrow" />
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}
                </div>

                <Space className="header-actions" size={16}>
                    <Tooltip title="Search" mouseEnterDelay={0.5}>
                        <button
                            className={`action-btn ${showSearch ? 'active' : ''}`}
                            onClick={() => {
                                const newShowSearch = !showSearch;
                                setShowSearch(newShowSearch);
                                if (!newShowSearch) {
                                    setSearchQuery('');
                                    setSearchResults([]);
                                    setShowResults(false);
                                }
                            }}
                        >
                            <FiSearch />
                        </button>
                    </Tooltip>

                    <Notifications />

                    <Dropdown
                        menu={{ items: userMenuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    >
                        <div className="user-avatar">
                            <Avatar>{user?.name ? getInitials(user.name) : 'U'}</Avatar>
                        </div>
                    </Dropdown>
                </Space>
            </div>
        </header>
    );
};

export default Header;