import React, { useState, useRef, useEffect } from 'react';
import { Input, Badge, Dropdown, Avatar, Tooltip, Space, List, Typography } from 'antd';
import {
    FiBell,
    FiSearch,
    FiUser,
    FiLogOut,
    FiArrowRight,
    FiFolder
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { useNavigate } from 'react-router-dom';
import './header.scss';
import { useLogout } from '../../../hooks/useLogout';
import Notifications from '../../../common/notifacations';

const { Text } = Typography;

const Header = () => {
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getUserFullName = (user) => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user?.username || 'User';
    };

    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = useLogout();
    const searchInputRef = useRef(null);
    const searchResultsRef = useRef(null);

    // Define searchable items with proper structure
    const searchableItems = [
        { title: "Dashboard", path: "/dashboard" },

        // CRM
        { title: "Projects", path: "/dashboard/crm/project", parent: "CRM" },
        { title: "Leads", path: "/dashboard/crm/lead", parent: "CRM" },
        { title: "Deals", path: "/dashboard/crm/deals", parent: "CRM" },
        { title: "Proposals", path: "/dashboard/crm/proposal", parent: "CRM" },
        { title: "Tasks", path: "/dashboard/crm/tasks", parent: "CRM" },
        { title: "Task Calendar", path: "/dashboard/crm/task-calendar", parent: "CRM" },
        { title: "CRM Setup", path: "/dashboard/crm-setup", parent: "CRM" },

        // HRM
        { title: "Employees", path: "/dashboard/hrm/employee", parent: "HRM" },
        { title: "Payroll", path: "/dashboard/hrm/payroll", parent: "HRM" },
        { title: "Leave", path: "/dashboard/hrm/leave", parent: "HRM" },
        { title: "Branch", path: "/dashboard/hrm/branch", parent: "HRM" },
        { title: "Designation", path: "/dashboard/hrm/designation", parent: "HRM" },
        { title: "Department", path: "/dashboard/hrm/department", parent: "HRM" },
        { title: "Training", path: "/dashboard/hrm/training", parent: "HRM" },
        { title: "Documents", path: "/dashboard/hrm/document", parent: "HRM" },
        { title: "Announcements", path: "/dashboard/hrm/announcement", parent: "HRM" },
        { title: "Roles", path: "/dashboard/hrm/role", parent: "HRM" },
        { title: "Meetings", path: "/dashboard/hrm/meeting", parent: "HRM" },
        { title: "Attendance", path: "/dashboard/hrm/attendance", parent: "HRM" },
        { title: "Holidays", path: "/dashboard/hrm/holiday", parent: "HRM" },

        // Job
        { title: "Jobs", path: "/dashboard/job/jobs", parent: "Job" },
        { title: "Job Candidates", path: "/dashboard/job/job-candidates", parent: "Job" },
        { title: "Job Onboarding", path: "/dashboard/job/job-onboarding", parent: "Job" },
        { title: "Job Applications", path: "/dashboard/job/job-applications", parent: "Job" },
        { title: "Offer Letters", path: "/dashboard/job/offer-letters", parent: "Job" },
        { title: "Interviews", path: "/dashboard/job/interviews", parent: "Job" },

        // Sales
        { title: "Products & Services", path: "/dashboard/sales/product-services", parent: "Sales" },
        { title: "Customers", path: "/dashboard/sales/customer", parent: "Sales" },
        { title: "Invoices", path: "/dashboard/sales/invoice", parent: "Sales" },
        { title: "Revenue", path: "/dashboard/sales/revenue", parent: "Sales" },
        { title: "Credit Notes", path: "/dashboard/sales/credit-notes", parent: "Sales" },

        // Purchase
        { title: "Vendors", path: "/dashboard/purchase/vendor", parent: "Purchase" },
        { title: "Billing", path: "/dashboard/purchase/billing", parent: "Purchase" },
        { title: "Debit Notes", path: "/dashboard/purchase/debit-note", parent: "Purchase" },

        // Communication
        { title: "Chat", path: "/dashboard/communication/chat", parent: "Communication" },
        { title: "Mail", path: "/dashboard/communication/mail", parent: "Communication" },
        { title: "Calendar", path: "/dashboard/communication/calendar", parent: "Communication" },

        // Support
        { title: "Tickets", path: "/dashboard/support/ticket", parent: "Support" },

        // Settings
        { title: "Currencies", path: "/dashboard/settings/currencies", parent: "Settings" },
        { title: "Countries", path: "/dashboard/settings/countries", parent: "Settings" },
        { title: "E-Signature", path: "/dashboard/settings/esignature", parent: "Settings" },
        { title: "Tax", path: "/dashboard/settings/tax", parent: "Settings" },

        // Others
        { title: "Profile", path: "/dashboard/profile" },
        { title: "Users", path: "/dashboard/user-management/users" },
        { title: "Clients", path: "/dashboard/clients" }
    ];

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
            onClick: () => navigate('/dashboard/profile')
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
                <h1>Dashboard</h1>
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
                            <Avatar>{getInitials(getUserFullName(user))}</Avatar>
                        </div>
                    </Dropdown>
                </Space>
            </div>
        </header>
    );
};

export default Header; 