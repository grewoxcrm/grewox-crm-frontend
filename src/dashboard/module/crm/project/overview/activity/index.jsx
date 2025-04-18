import React from 'react';
import { Card, Timeline, Tag, Avatar, Tooltip } from 'antd';
import {
    FiPlus, FiEdit2, FiTrash2, FiFileText, FiDollarSign,
    FiFlag, FiCheckSquare, FiMessageSquare, FiUser, FiClock
} from 'react-icons/fi';
import './activity.scss';

const ProjectActivity = ({ project }) => {
    // Dummy data for demonstration
    const activities = [
        {
            id: 1,
            type: 'task',
            action: 'created',
            title: 'Design System Implementation',
            user: {
                name: 'John Doe',
                avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
            },
            timestamp: '2024-03-17T09:15:00',
            icon: <FiCheckSquare />,
            color: '#1890ff'
        },
        {
            id: 2,
            type: 'milestone',
            action: 'completed',
            title: 'Project Planning Phase',
            user: {
                name: 'Jane Smith',
                avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
            },
            timestamp: '2024-03-16T14:20:00',
            icon: <FiFlag />,
            color: '#52c41a'
        },
        {
            id: 3,
            type: 'note',
            action: 'added',
            title: 'Client Meeting Notes',
            user: {
                name: 'Mike Johnson',
                avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
            },
            timestamp: '2024-03-15T10:30:00',
            icon: <FiMessageSquare />,
            color: '#722ed1'
        },
        {
            id: 4,
            type: 'payment',
            action: 'received',
            title: '$5,000 Payment',
            user: {
                name: 'Sarah Wilson',
                avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
            },
            timestamp: '2024-03-14T16:45:00',
            icon: <FiDollarSign />,
            color: '#52c41a'
        },
        {
            id: 5,
            type: 'file',
            action: 'uploaded',
            title: 'Project Requirements Document',
            user: {
                name: 'Tom Brown',
                avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
            },
            timestamp: '2024-03-13T11:20:00',
            icon: <FiFileText />,
            color: '#faad14'
        }
    ];

    const getActionColor = (action) => {
        switch (action) {
            case 'created':
                return '#1890ff';
            case 'completed':
                return '#52c41a';
            case 'added':
                return '#722ed1';
            case 'received':
                return '#52c41a';
            case 'uploaded':
                return '#faad14';
            default:
                return '#1890ff';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="project-activity">
            <Card title="Project Activity">
                <Timeline
                    items={activities.map(activity => ({
                        dot: (
                            <div
                                className="timeline-dot"
                                style={{ color: activity.color }}
                            >
                                {activity.icon}
                            </div>
                        ),
                        children: (
                            <div className="activity-item">
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <Tag color={getActionColor(activity.action)}>
                                            {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                                        </Tag>
                                        <h4>{activity.title}</h4>
                                    </div>
                                    <div className="activity-meta">
                                        <span className="user-info">
                                            <FiUser />
                                            <Avatar src={activity.user.avatar} size="small" />
                                            {activity.user.name}
                                        </span>
                                        <span className="timestamp">
                                            <FiClock />
                                            {formatDate(activity.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    }))}
                />
            </Card>
        </div>
    );
};

export default ProjectActivity; 