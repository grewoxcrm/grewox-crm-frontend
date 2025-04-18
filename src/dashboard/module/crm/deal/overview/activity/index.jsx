import React, { useState, useEffect } from 'react';
import { Card, Timeline, Tag, Avatar, Tooltip, Spin, Empty, Badge, Input, Button, TimePicker, Space, Typography, DatePicker } from 'antd';
import {
    FiPlus, FiEdit2, FiTrash2, FiFileText, FiDollarSign,
    FiFlag, FiCheckSquare, FiMessageSquare, FiUser, FiClock, FiBell, FiSearch, FiFilter
} from 'react-icons/fi';
import './activity.scss';
import { useGetActivitiesQuery } from '../../../lead/overview/activity/services/activityApi';
import moment from 'moment';

const DealActivity = ({ deal }) => {
    const [lastActivityCount, setLastActivityCount] = useState(0);
    const [newActivityCount, setNewActivityCount] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [dateFilter, setDateFilter] = useState(null);
    const [timeFilter, setTimeFilter] = useState(null);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const { data: response, isLoading, error } = useGetActivitiesQuery(deal?.id, {
        skip: !deal?.id,
        pollingInterval: 3000,
        refetchOnMountOrArgChange: true
    });

    useEffect(() => {
        if (response?.data) {
            const currentCount = response.data.length;
            if (currentCount > lastActivityCount) {
                setNewActivityCount(currentCount - lastActivityCount);
            }
            setLastActivityCount(currentCount);
            filterActivities(response.data);
        }
    }, [response?.data, lastActivityCount, searchText, dateFilter, timeFilter]);

    const filterActivities = (activities) => {
        let filtered = [...activities];

        // Apply date filter
        if (dateFilter) {
            const selectedDate = moment(dateFilter).format('YYYY-MM-DD');
            filtered = filtered.filter(activity => {
                const activityDate = moment(activity.createdAt).format('YYYY-MM-DD');
                return activityDate === selectedDate;
            });
        }

        // Apply time filter
        if (timeFilter) {
            const selectedTime = moment(timeFilter).format('HH:mm');
            filtered = filtered.filter(activity => {
                const activityTime = moment(activity.createdAt).format('HH:mm');
                return activityTime === selectedTime;
            });
        }

        // Apply search filter
        if (searchText) {
            filtered = filtered.filter(activity => 
                activity.activity_message?.toLowerCase().includes(searchText.toLowerCase()) ||
                activity.performed_by?.toLowerCase().includes(searchText.toLowerCase()) ||
                activity.action?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredActivities(filtered);
    };

    const handleDateChange = (date) => {
        setDateFilter(date);
        if (response?.data) {
            filterActivities(response.data);
        }
    };

    const handleTimeChange = (time) => {
        setTimeFilter(time);
        if (response?.data) {
            filterActivities(response.data);
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
        if (response?.data) {
            filterActivities(response.data);
        }
    };

    const getActionColor = (action) => {
        switch (action?.toLowerCase()) {
            case 'created':
                return '#1890ff';
            case 'completed':
                return '#52c41a';
            case 'added':
                return '#722ed1';
            case 'updated':
                return '#52c41a';
            case 'uploaded':
                return '#faad14';
            case 'deleted':
                return '#ff4d4f';
            default:
                return '#1890ff';
        }
    };

    const getActivityIcon = (activityFrom) => {
        switch (activityFrom?.toLowerCase()) {
            case 'task':
                return <FiCheckSquare />;
            case 'milestone':
                return <FiFlag />;
            case 'note':
                return <FiMessageSquare />;
            case 'status':
                return <FiDollarSign />;
            case 'file':
                return <FiFileText />;
            case 'meeting':
                return <FiUser />;
            case 'deal_member':
                return <FiUser />;
            case 'sales_invoice':
                return <FiDollarSign />;
            default:
                return <FiMessageSquare />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return moment(dateString).format('DD MMM YYYY, hh:mm A');
    };

    if (isLoading) {
        return (
            <div className="deal-activity">
                <Card title="Deal Activity">
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="large" />
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="deal-activity">
                <Card title="Deal Activity">
                    <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                        Error loading activities
                    </div>
                </Card>
            </div>
        );
    }

    const activities = response?.data || [];

    if (activities.length === 0) {
        return (
            <div className="deal-activity">
                <Card title="Deal Activity">
                    <Empty description="No activities found for this deal" />
                </Card>
            </div>
        );
    }

    return (
        <div className="deal-activity">
            <Card 
                title={
                    <div className="card-header">
                        <div className="title-section">
                            Deal Activity
                            {newActivityCount > 0 && (
                                <Badge 
                                    count={newActivityCount} 
                                    style={{ backgroundColor: '#1890ff' }}
                                    title={`${newActivityCount} new activities`}
                                />
                            )}
                        </div>
                        <div className="filter-section">
                            <Space>
                                <DatePicker
                                    value={dateFilter}
                                    onChange={handleDateChange}
                                    format="DD/MM/YYYY"
                                    style={{ width: 150, height: '40px' }}
                                    placeholder="Select date"
                                    allowClear
                                />
                                <TimePicker
                                    value={timeFilter}
                                    onChange={handleTimeChange}
                                    format="HH:mm"
                                    style={{ width: 150, height: '40px' }}
                                    placeholder="Select time"
                                    allowClear
                                />
                                <Input
                                    placeholder="Search activities..."
                                    allowClear
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onSearch={handleSearch}
                                    style={{ height: '40px', width: '300px' }}
                                />
                            </Space>
                        </div>
                    </div>
                }
            >
                <Timeline
                    items={filteredActivities.map(activity => ({
                        dot: (
                            <div
                                className="timeline-dot"
                                style={{ color: getActionColor(activity.action) }}
                            >
                                {getActivityIcon(activity.activity_from)}
                            </div>
                        ),
                        children: (
                            <div className="activity-item">
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <Tag color={getActionColor(activity.action)}>
                                            {activity.action?.charAt(0)?.toUpperCase() + activity.action?.slice(1)}
                                        </Tag>
                                        <h4>{activity.activity_message || 'Untitled Activity'}</h4>
                                    </div>
                                    <div className="activity-meta">
                                        <span className="user-info">
                                            <FiUser />
                                            <Avatar size="small">
                                                {activity.performed_by?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                            {activity.performed_by || 'Unknown User'}
                                        </span>
                                        <span className="timestamp">
                                            <FiClock />
                                            {formatDate(activity.createdAt)}
                                        </span>
                                    </div>
                                    {/* {activity.activity_message && (
                                        <div className="activity-description">
                                            {activity.activity_message}
                                        </div>
                                    )} */}
                                </div>
                            </div>
                        )
                    }))}
                />
            </Card>
        </div>
    );
};

export default DealActivity; 