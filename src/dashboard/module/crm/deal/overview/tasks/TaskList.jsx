import React, { useMemo } from 'react';
import { Table, Button, Tag, Dropdown, Tooltip, Typography, Avatar } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiFile, FiDownload, FiUser } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const TaskList = ({ onEdit, onDelete, onView, searchText = '', filters = {}, tasks = [], users = [] }) => {
    const userMap = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
    }, [users]);

    const filteredTasks = useMemo(() => {
        const tasksArray = Array.isArray(tasks) ? tasks : [];

        return tasksArray.filter(task => {
            const taskName = task?.taskName?.toLowerCase() || '';
            const description = task?.description?.toLowerCase() || '';
            const reporter = userMap[task?.task_reporter]?.username?.toLowerCase() || '';
            const searchLower = searchText.toLowerCase();

            const matchesSearch = !searchText ||
                taskName.includes(searchLower) ||
                description.includes(searchLower) ||
                reporter.includes(searchLower);

            const matchesPriority = !filters.priority ||
                task?.priority === filters.priority;

            const matchesStatus = !filters.status ||
                task?.status === filters.status;

            const matchesDateRange = !filters.dateRange?.length ||
                (dayjs(task?.dueDate).isAfter(filters.dateRange[0]) &&
                    dayjs(task?.dueDate).isBefore(filters.dateRange[1]));

            return matchesSearch && matchesPriority && matchesStatus && matchesDateRange;
        });
    }, [tasks, searchText, filters, userMap]);

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView?.(record),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit?.(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => onDelete?.(record),
                danger: true,
            },
        ],
    });

    const getAssignedUsers = (assignTo) => {
        try {
            if (typeof assignTo === 'string') {
                const parsed = JSON.parse(assignTo);
                return parsed?.assignedusers || [];
            }
            return assignTo?.assignedusers || [];
        } catch (error) {
            return [];
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'taskName',
            key: 'taskName',
            sorter: (a, b) => (a?.taskName || '').localeCompare(b?.taskName || ''),
            render: (text, record) => (
                <Text strong style={{ cursor: 'pointer' }} onClick={() => onView?.(record)}>
                    {text}
                </Text>
            ),
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignTo',
            key: 'assignTo',
            render: (assignTo) => {
                const assignedUserIds = getAssignedUsers(assignTo);
                const assignedUsers = assignedUserIds.map(id => userMap[id]).filter(Boolean);

                if (assignedUsers.length === 0) {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <span style={{ color: '#999' }}>Unassigned</span>
                        </div>
                    );
                }

                if (assignedUsers.length === 1) {
                    const user = assignedUsers[0];
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Avatar
                                src={user.profilePic}
                                style={{
                                    backgroundColor: user.profilePic ? 'transparent' : '#1890ff'
                                }}
                            >
                                {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                            </Avatar>
                            <span>{user.username || user.email}</span>
                        </div>
                    );
                }

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Avatar.Group
                            maxCount={3}
                            maxStyle={{
                                color: '#f56a00',
                                backgroundColor: '#fde3cf',
                            }}
                        >
                            {assignedUsers.map((user) => (
                                <Tooltip key={user.id} title={user.username || user.email}>
                                    <Avatar
                                        src={user.profilePic}
                                        style={{
                                            backgroundColor: user.profilePic ? 'transparent' : '#1890ff'
                                        }}
                                    >
                                        {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                                    </Avatar>
                                </Tooltip>
                            ))}
                        </Avatar.Group>
                    </div>
                );
            },
        },
        {
            title: 'Task Reporter',
            dataIndex: 'task_reporter',
            key: 'task_reporter',
            render: (reporterId) => {
                const user = userMap[reporterId];
                if (!user) return <span>-</span>;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar
                            src={user.profilePic}
                            style={{
                                backgroundColor: user.profilePic ? 'transparent' : '#1890ff'
                            }}
                        >
                            {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                        </Avatar>
                        <span>{user.username || user.email}</span>
                    </div>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === 'Completed' ? 'green' :
                        status === 'In Progress' ? 'blue' : 'orange'
                }
                    className={`task-status-tag ${(status || '').toLowerCase().replace(' ', '-')}`}
                >
                    {status || 'Pending'}
                </Tag>
            ),
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => (
                <Tag color={
                    priority === 'High' ? 'red' :
                        priority === 'Medium' ? 'orange' : 'green'
                }
                    className={`task-priority-tag ${(priority || '').toLowerCase()}`}
                >
                    {priority || 'Low'}
                </Tag>
            ),
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => (
                <span>{date ? dayjs(date).format('MMM DD, YYYY') : '-'}</span>
            ),
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => (
                <span>{date ? dayjs(date).format('MMM DD, YYYY') : '-'}</span>
            ),
        },
        {
            title: 'Files',
            dataIndex: 'file',
            key: 'file',
            render: (file) => {
                if (!file) return <span>-</span>;

                // Handle array of files
                const files = Array.isArray(file) ? file : [file];

                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {files.map((fileUrl, index) => {
                            const fileName = fileUrl.split('/').pop();
                            const fileExtension = fileName.split('.').pop().toLowerCase();

                            // Determine if it's an image
                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

                            return (
                                <Tooltip key={index} title={fileName}>
                                    <Button
                                        type="text"
                                        className="file-button"
                                        onClick={() => window.open(fileUrl, '_blank')}
                                        icon={
                                            isImage ? (
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '1px solid #d9d9d9'
                                                }}>
                                                    <img
                                                        src={fileUrl}
                                                        alt={fileName}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <FiFile style={{ fontSize: '16px' }} />
                                            )
                                        }
                                        style={{
                                            padding: 4,
                                            height: 'auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    />
                                </Tooltip>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (createdBy) => <span>{createdBy || '-'}</span>,
        },
        {
            title: 'Action',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="task-actions-dropdown"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                        onClick={(e) => e.preventDefault()}
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="task-list">
            <Table
                columns={columns}
                dataSource={filteredTasks}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="task-table"
            />
        </div>
    );
};

export default TaskList; 