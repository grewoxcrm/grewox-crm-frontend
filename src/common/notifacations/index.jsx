import React, { useState, useEffect } from 'react';
import { Tabs, Typography, Button, Badge, Empty, Dropdown, notification } from 'antd';
import { BiBell, BiCalendarEvent } from 'react-icons/bi';
import { useGetAllNotificationsQuery, useMarkAsReadMutation, useClearAllNotificationsMutation } from './services/notificationApi';
import './notifications.scss';
import { selectCurrentUser } from '../../auth/services/authSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
const { Title } = Typography;
const NotificationsComponent = () => {
    const navigate = useNavigate();
    const loggedInUser = useSelector(selectCurrentUser);
    const id = loggedInUser?.id;
    
    const { data: notificationsData, isLoading, error, refetch } = useGetAllNotificationsQuery(id);

    
    const [markAsRead] = useMarkAsReadMutation();
    const [clearAll] = useClearAllNotificationsMutation();
    
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [processedNotifications] = useState(new Set());
    // Poll for new notifications every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 20000);
        return () => clearInterval(interval);
    }, [refetch]);
    // Filter notifications
    const notifications = notificationsData?.data || [];
    const unreadNotifications = notifications.filter(n => {
        try {
            // Parse the users JSON string to get assigned users
            const usersArray = JSON.parse(n.users);
            const assignedUsers = Array.isArray(usersArray) ? usersArray : [];
            
            // Check if current user is in assigned users list OR if user's ID matches client_id
            const isAssignedUser = assignedUsers.includes(id);
            // const isClientUser = n.client_id === id;

            // Show notification if unread AND (user is assigned OR is client)
            return !n.read && (isAssignedUser);
        } catch (error) {
            console.error('Error parsing users data:', error);
            return false;
        }
    });

    const normalNotifications = unreadNotifications.filter(n => n.notification_type === 'normal');
    const reminders = unreadNotifications.filter(n => n.notification_type === 'reminder');
    
    // console.log('Notification Status:', {
    //     total: notifications.length,
    //     unread: unreadNotifications.length,
    //     normal: normalNotifications.length,
    //     reminders: reminders.length
    // });

    // Show notifications
    const getPriorityColor = (priority) => {
        switch(priority?.toLowerCase()) {
            case 'high':
                return '#dc2626'; // red
            case 'medium':
                return '#f59e0b'; // orange 
            case 'low':
                return '#10b981'; // green
            default:
                return '#7c3aed'; // default purple
        }
    };

    useEffect(() => {
        // Show all unread notifications
        unreadNotifications.forEach(notif => {
            if (!processedNotifications.has(notif.id)) {
                const isReminder = notif.notification_type === 'reminder';
                notification.info({
                    message: <span style={{fontWeight: 'bold', fontSize: '16px'}}>{notif.title || ''}</span>,
                    description: (
                        <div>
                            {notif.message && <div>{notif.message}</div>}
                            <div style={{marginTop: '4px', color: '#666'}}>
                                {notif.date && <span style={{fontWeight: 500}}>{new Date(notif.date).toLocaleDateString('en-GB')}</span>}
                                {notif.time && 
                                    <span style={{fontWeight: 500}}>
                                        {' '}{new Date(`2000-01-01 ${notif.time}`).toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true})}
                                    </span>
                                }
                            </div>
                        </div>
                    ),
                    icon: isReminder ? <BiCalendarEvent style={{ color: getPriorityColor(notif.priority) }} /> : <BiBell style={{ color: getPriorityColor(notif.priority) }} />,
                    placement: 'topRight', 
                    duration: 0,
                    key: notif.id,
                    onClick: () => handleMarkAsRead(notif.id, notif),
                    className: `notification-${notif.priority}`
                });

                // Helper function to get color based on priority
            
                processedNotifications.add(notif.id);
                // console.log('Showing notification:', {
                //     id: notif.id,
                //     type: notif.notification_type,
                //     title: notif.title,
                //     time: notif.time,
                //     date: notif.date
                // });
            }
        });
    }, [notifications, unreadNotifications]);
    const handleMarkAsRead = async (id, notification) => {
        try {
            // console.log('Marking as read:', {
            //     id,
            //     title: notification.title,
            //     type: notification.notification_type
            // });
            await markAsRead(id);
            notification.close(id);
            
            if (notification.related_id) {
                switch (notification.notification_type) {
                    case 'reminder':
                        if (notification.description?.includes('Task Due')) {
                            navigate(`/dashboard/crm/tasks/${notification.related_id}`);
                        } else {
                            navigate(`/dashboard/crm/deals/${notification.related_id}`);
                        }
                        break;
                    default:
                        navigate(`/dashboard/crm/deals/${notification.related_id}`);
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };
    const handleClearAll = async () => {
        try {
            await clearAll();
            setDropdownOpen(false);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };
    const items = [
        {
            key: '1',
            label: (
                <Badge count={normalNotifications.length} size="small">
                    <span>Notifications</span>
                </Badge>
            ),
            children: (
                <div className="notifications-list">
                    {normalNotifications.length > 0 ? (
                        normalNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                onClick={() => handleMarkAsRead(notification.id, notification)}
                            >
                                <div className="notification-content">
                                    <div className="notification-icon-wrapper">
                                        <BiBell className="notification-icon info" />
                                    </div>
                                    <div className="notification-details">
                                        <Typography.Text strong>{notification.title}</Typography.Text>
                                        <Typography.Text type="secondary">{notification.message}</Typography.Text>
                                        {notification.description && (
                                            <Typography.Text className="notification-description">
                                                {notification.description}
                                            </Typography.Text>
                                        )}
                                        {/* <span className="notification-time">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </span> */}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Empty description="No notifications" />
                    )}
                </div>
            ),
        },
        {
            key: '2',
            label: (
                <Badge count={reminders.length} size="small">
                    <span>Reminders</span>
                </Badge>
            ),
            children: (
                <div className="notifications-list">
                    {reminders.length > 0 ? (
                        reminders.map((reminder) => (
                            <div
                                key={reminder.id}
                                className={`notification-item reminder-item ${!reminder.read ? 'unread' : ''}`}
                                onClick={() => handleMarkAsRead(reminder.id, reminder)}
                            >
                                <div className="notification-content">
                                    <div className="notification-icon-wrapper">
                                        <BiCalendarEvent className="notification-icon reminder" />
                                    </div>
                                    <div className="notification-details">
                                        <Typography.Text strong>{reminder.title}</Typography.Text>
                                        <Typography.Text type="secondary">{reminder.message}</Typography.Text>
                                        {reminder.description && (
                                            <Typography.Text className="notification-description">
                                                {reminder.description}
                                            </Typography.Text>
                                        )}
                                        <div className="reminder-time">
                                            <span>Due: {new Date(reminder.date).toLocaleDateString()}</span>
                                            <span>{reminder.time}</span>
                                        </div>
                                        <span className="notification-time">
                                            {new Date(reminder.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Empty description="No reminders" />
                    )}
                </div>
            ),
        },
    ];
    const notificationPanel = (
        <div className="notifications-dropdown">
            <div className="notifications-header">
                <Title level={5}>Notifications</Title>
                {unreadNotifications.length > 0 && (
                    <Button type="link" onClick={handleClearAll}>
                        Clear all
                    </Button>
                )}
            </div>
            <Tabs
                defaultActiveKey="1"
                items={items}
                className="notification-tabs"
            />
        </div>
    );
    const totalUnread = unreadNotifications.length;
    return (
        <Dropdown
            overlay={notificationPanel}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="notification-dropdown-overlay"
            open={dropdownOpen}
            onOpenChange={(visible) => setDropdownOpen(visible)}
        >
            <Badge count={totalUnread} className="notification-badge">
                <Button type="text" className="notification-button" loading={isLoading}>
                    <BiBell className="notification-bell-icon" />
                </Button>
            </Badge>
        </Dropdown>
    );
};
export default NotificationsComponent;