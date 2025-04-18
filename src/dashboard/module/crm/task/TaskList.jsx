import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Dropdown, Tooltip, Typography, Avatar, Space, Input, DatePicker, Modal } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiFile, FiDownload, FiUser, FiX, FiCalendar, FiClock, FiPaperclip, FiAlertCircle, FiCheckSquare } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const TaskDetailCard = ({ record, users, visible, onClose }) => {
    const getAssignedUsers = (assignTo) => {
        try {
            if (typeof assignTo === 'string') {
                const parsed = JSON.parse(assignTo);
                return parsed?.assignedusers || [];
            }
            return assignTo?.assignedusers || [];
        } catch (error) {
            console.log('Error parsing assignTo:', error);
            return [];
        }
    };

    const assignedUsers = getAssignedUsers(record?.assignTo)
        .map(id => users?.find(u => u.id === id))
        .filter(Boolean);

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={480}
            centered
            closeIcon={<FiX style={{ color: '#fff' }} />}
            maskStyle={{ backdropFilter: 'blur(4px)', background: 'rgba(0, 0, 0, 0.2)' }}
            bodyStyle={{ padding: 0 }}
            className="task-detail-modal"
        >
            <div style={{
                background: '#1890FF',
                padding: '24px',
                position: 'relative',
                borderRadius: '8px 8px 0 0',
            }}>
                <div style={{ marginBottom: 16 }}>
                    <Tag style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: 'none',
                        color: '#fff',
                        marginBottom: 12,
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px'
                    }}>
                        Task #{record?.id?.slice(-8).toUpperCase()}
                    </Tag>
                    <Text style={{
                        fontSize: 24,
                        display: 'block',
                        color: '#fff',
                        fontWeight: '600',
                        marginBottom: 16,
                        lineHeight: '1.2'
                    }}>
                        {record?.taskName}
                    </Text>
                    <Space size={8}>
                        <Tag style={{
                            background: record?.status === 'In Progress' ? '#E6F7FF' : '#FFF7E6',
                            border: `1px solid ${record?.status === 'In Progress' ? '#1890FF' : '#FFA940'}`,
                            color: record?.status === 'In Progress' ? '#1890FF' : '#FFA940',
                            borderRadius: '4px',
                            padding: '4px 8px'
                        }}>
                            {record?.status}
                        </Tag>
                        <Tag style={{
                            background: record?.priority === 'High' ? '#ff4d4f' :
                                record?.priority === 'Medium' ? '#FFA940' : '#52c41a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px'
                        }}>
                            {record?.priority} Priority
                        </Tag>
                    </Space>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px',
                    background: '#E6F7FF',
                    padding: '16px',
                    borderRadius: '8px'
                }}>
                    <div>
                        <Text type="secondary" style={{
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 4,
                            color: '#6B7280'
                        }}>
                            <FiCalendar style={{ strokeWidth: 2 }} /> Start Date
                        </Text>
                        <Text strong style={{ fontSize: '14px' }}>
                            {dayjs(record?.startDate).format('MMM DD, YYYY')}
                        </Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 4,
                            color: '#6B7280'
                        }}>
                            <FiClock style={{ strokeWidth: 2 }} /> Due Date
                        </Text>
                        <Text strong style={{ fontSize: '14px' }}>
                            {dayjs(record?.dueDate).format('MMM DD, YYYY')}
                        </Text>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Text type="secondary" style={{
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginBottom: 12,
                        color: '#6B7280'
                    }}>
                        <FiUser style={{ strokeWidth: 2 }} /> Assigned Team Members
                    </Text>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {assignedUsers.map(user => (
                            <div key={user.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '8px 12px',
                                background: '#F9FAFB',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB'
                            }}>
                                <Avatar
                                    src={user.profilePic}
                                    style={{
                                        backgroundColor: '#1890FF',
                                        color: '#fff',
                                        fontWeight: '500'
                                    }}
                                >
                                    {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                                </Avatar>
                                <div>
                                    <Text strong style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        color: '#111827'
                                    }}>
                                        {user.username || user.email}
                                    </Text>
                                    <Text style={{
                                        fontSize: '12px',
                                        color: '#6B7280'
                                    }}>
                                        Team Member
                                    </Text>
                                </div>
                            </div>
                        ))}
                        {assignedUsers.length === 0 && (
                            <Text type="secondary" style={{ padding: '12px', textAlign: 'center' }}>
                                No users assigned
                            </Text>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <Text type="secondary" style={{
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginBottom: 12,
                        color: '#6B7280'
                    }}>
                        <FiAlertCircle style={{ strokeWidth: 2 }} /> Description
                    </Text>
                    <div style={{
                        background: '#F9FAFB',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                    }}>
                        <Paragraph style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.5'
                        }}>
                            {record?.description || 'No description provided'}
                        </Paragraph>
                    </div>
                </div>

                {record?.file && (
                    <div>
                        <Text type="secondary" style={{
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginBottom: 12,
                            color: '#6B7280'
                        }}>
                            <FiPaperclip style={{ strokeWidth: 2 }} /> Attachments
                        </Text>
                        <Button
                            icon={<FiPaperclip />}
                            type="default"
                            style={{
                                width: '100%',
                                height: '40px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                color: '#1890FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: '#F9FAFB'
                            }}
                            onClick={() => window.open(record.file, '_blank')}
                        >
                            View Attachment
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

const TaskList = ({ onEdit, onDelete, onView, searchText = '', filters = {}, tasks = [], users = [] }) => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    console.log('Raw Tasks in TaskList:', JSON.stringify(tasks, null, 2));

    const userMap = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
    }, [users]);

    // Validate and transform tasks data
    const validTasks = useMemo(() => {
        return tasks.map(task => {
            if (!task.taskName) {
                console.warn('Task missing taskName:', task);
            }
            const validatedTask = {
                ...task,
                key: task.id,
                taskName: task.taskName || task.task_name || 'Untitled Task',
                assignTo: task.assignTo || '{"assignedusers": []}', // Changed from users to assignedusers
                priority: task.priority || 'Low',
                status: task.status || 'Pending',
                startDate: task.startDate || null,
                dueDate: task.dueDate || null,
                created_by: task.created_by || 'Unknown',
                task_reporter: task.task_reporter || ''
            };
            console.log('Validated task:', validatedTask);
            return validatedTask;
        });
    }, [tasks]);

    // Define status options
    const statusOptions = [
        { id: 'Pending', name: 'Pending' },
        { id: 'In Progress', name: 'In Progress' },
        { id: 'Completed', name: 'Completed' }
    ];

    // Define priority options
    const priorityOptions = [
        { id: 'Low', name: 'Low' },
        { id: 'Medium', name: 'Medium' },
        { id: 'High', name: 'High' }
    ];

    // Define date options

    const filteredTasks = useMemo(() => {
        const tasksArray = Array.isArray(validTasks) ? validTasks : [];
        console.log('Filtered tasks before filtering:', tasksArray);

        const filtered = tasksArray.filter(task => {
            const taskName = task?.taskName?.toLowerCase() || '';
            if (!task?.taskName) {
                console.warn('Task missing taskName in filter:', task);
            }
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
                (dayjs(task?.startDate).isAfter(filters.dateRange[0]) &&
                    dayjs(task?.dueDate).isBefore(filters.dateRange[1]));

            return matchesSearch && matchesPriority && matchesStatus && matchesDateRange;
        });

        console.log('Filtered tasks after filtering:', filtered);
        return filtered;
    }, [validTasks, searchText, filters, userMap]);

    const handleView = (record) => {
        setSelectedTask(record);
        setModalVisible(true);
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => handleView(record),
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
                return parsed?.assignedusers || []; // Changed from users to assignedusers
            }
            return assignTo?.assignedusers || []; // Changed from users to assignedusers
        } catch (error) {
            console.error('Error parsing assignTo:', error);
            return [];
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'taskName',
            key: 'taskName',
            width: 200,
            ellipsis: true,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search task title"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Filter
                        </Button>
                        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) =>
                record.taskName?.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <Tooltip title={text}>
                    <Text strong style={{ cursor: 'pointer' }} onClick={() => onView?.(record)}>
                        {text}
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignTo',
            key: 'assignTo',
            width: 150,
            render: (assignTo) => {
                const assignedUsers = getAssignedUsers(assignTo);

                if (assignedUsers.length === 0) {
                    return <Text type="secondary">Unassigned</Text>;
                }

                return (
                    <Avatar.Group
                        maxCount={2}
                        maxStyle={{
                            color: '#f56a00',
                            backgroundColor: '#fde3cf',
                        }}
                    >
                        {assignedUsers.map((userId) => {
                            const user = userMap[userId];
                            if (!user) return null;
                            return (
                                <Tooltip key={userId} title={user.username || user.email}>
                                    <Avatar
                                        src={user.profilePic}
                                        style={{
                                            backgroundColor: user.profilePic ? 'transparent' : '#1890ff'
                                        }}
                                    >
                                        {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                                    </Avatar>
                                </Tooltip>
                            );
                        })}
                    </Avatar.Group>
                );
            },
        },
        {
            title: 'Task Reporter',
            dataIndex: 'task_reporter',
            key: 'task_reporter',
            width: 150,
            render: (reporterId) => {
                const user = userMap[reporterId];
                if (!user) return <Text type="secondary">-</Text>;

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
                        <Text>{user.username || user.email}</Text>
                    </div>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={
                    status === 'Completed' ? 'success' :
                        status === 'In Progress' ? 'processing' :
                            'warning'
                }>
                    {status || 'Pending'}
                </Tag>
            ),
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: (priority) => (
                <Tag color={
                    priority === 'High' ? 'error' :
                        priority === 'Medium' ? 'warning' :
                            'success'
                }>
                    {priority || 'Low'}
                </Tag>
            ),
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            width: 120,
            render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 120,
            render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
        },
        {
            title: 'Files',
            dataIndex: 'file',
            key: 'file',
            width: 100,
            render: (file) => {
                if (!file) return <Text type="secondary">-</Text>;

                const files = Array.isArray(file) ? file : [file];
                return (
                    <Space>
                        {files.map((fileUrl, index) => {
                            const fileName = fileUrl.split('/').pop();
                            const fileExtension = fileName.split('.').pop().toLowerCase();
                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

                            return (
                                <Tooltip key={index} title={fileName}>
                                    <Button
                                        type="text"
                                        icon={isImage ? <img
                                            src={fileUrl}
                                            alt={fileName}
                                            style={{ width: 24, height: 24, objectFit: 'cover' }}
                                        /> : <FiFile />}
                                        onClick={() => window.open(fileUrl, '_blank')}
                                    />
                                </Tooltip>
                            );
                        })}
                    </Space>
                );
            },
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
            width: 150,
            render: (text) => <Text>{text || '-'}</Text>,
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
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
                    showTotal: (total) => `Total ${total} items`
                }}
                className="task-table"
                onRow={(record) => ({
                    onClick: () => handleView(record),
                    style: { cursor: 'pointer' }
                })}
            />

            <TaskDetailCard
                record={selectedTask}
                users={users}
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedTask(null);
                }}
            />
        </div>
    );
};

export default TaskList;