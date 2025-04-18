import React, { useState } from 'react';
import { Table, Tag, Space, Button, Avatar, Tooltip, Dropdown, Modal, message } from 'antd';
import { FiCheckSquare, FiCalendar, FiEdit2, FiTrash2, FiMoreVertical, FiAlertCircle } from 'react-icons/fi';
import { useGetFollowupTaskByIdQuery, useDeleteFollowupTaskMutation } from './services/followupTaskApi';
import dayjs from 'dayjs';
import './followuptask.scss';
import EditFollowupTask from './EditFollowupTask';

const FollowupTaskList = ({ leadId, users }) => {
    const { data: followupTask, isLoading: followupTaskLoading } = useGetFollowupTaskByIdQuery(leadId);
    const [deleteFollowupTask] = useDeleteFollowupTaskMutation();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const handleEdit = (taskId) => {
        setSelectedTaskId(taskId);
        setEditModalVisible(true);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Confirmation',
            content: 'Are you sure you want to delete this task?',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteFollowupTask(id).unwrap();
                    message.success('Task deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete task');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCheckSquare style={{ color: '#1890ff' }} />
                    <span>{text}</span>
                </div>
            )
        },
        {
            title: 'Assigned To',
            dataIndex: 'assigned_to',
            key: 'assigned_to',
            render: (assignedTo) => {
                try {
                    const parsedAssignees = JSON.parse(assignedTo);
                    return (
                        <Avatar.Group maxCount={2} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                            {parsedAssignees.assigned_to.map((userId) => {
                                const user = users.find(u => u.id === userId);
                                return (
                                    <Tooltip title={user?.username} key={userId}>
                                        <Avatar
                                            style={{
                                                backgroundColor: user?.color || '#1890ff',
                                            }}
                                        >
                                            {user?.username?.[0]?.toUpperCase() || '?'}
                                        </Avatar>
                                    </Tooltip>
                                );
                            })}
                        </Avatar.Group>
                    );
                } catch (e) {
                    return '-';
                }
            }
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            key: 'due_date',
            render: (date) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCalendar style={{ color: '#1890ff' }} />
                    <span>{dayjs(date).format('DD MMM YYYY')}</span>
                </div>
            )
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => {
                const priorityColors = {
                    highest: { color: '#ff4d4f', bg: '#fff1f0' },
                    high: { color: '#faad14', bg: '#fff7e6' },
                    medium: { color: '#1890ff', bg: '#e6f7ff' },
                    low: { color: '#52c41a', bg: '#f6ffed' }
                };
                const style = priorityColors[priority] || priorityColors.medium;
                
                return (
                    <Tag style={{
                        color: style.color,
                        backgroundColor: style.bg,
                        border: 'none',
                        borderRadius: '12px',
                        padding: '2px 12px'
                    }}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Tag>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusColors = {
                    not_started: { color: '#8c8c8c', bg: '#f5f5f5' },
                    in_progress: { color: '#1890ff', bg: '#e6f7ff' },
                    completed: { color: '#52c41a', bg: '#f6ffed' },
                    on_hold: { color: '#faad14', bg: '#fff7e6' },
                    cancelled: { color: '#ff4d4f', bg: '#fff1f0' }
                };
                const style = statusColors[status] || statusColors.not_started;
                
                return (
                    <Tag style={{
                        color: style.color,
                        backgroundColor: style.bg,
                        border: 'none',
                        borderRadius: '12px',
                        padding: '2px 12px'
                    }}>
                        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Tag>
                );
            }
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (creator) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                        {creator?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <span>{creator}</span>
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'edit',
                                    label: 'Edit',
                                    icon: <FiEdit2 />,
                                    onClick: () => handleEdit(record.id)
                                },
                                {
                                    key: 'delete',
                                    label: 'Delete',
                                    icon: <FiTrash2 style={{ color: '#ff4d4f' }} />,
                                    danger: true,
                                    onClick: () => handleDelete(record.id)
                                }
                            ]
                        }}
                        trigger={['click']}
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical />}
                            className="action-btn"
                        />
                    </Dropdown>
                </Space>
            )
        }
    ];
    

    return (
        <>
            <Table
                dataSource={followupTask?.data || []}
                columns={columns}
                rowKey="id"
                loading={followupTaskLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} tasks`
                }}
                className="followup-table"
            />
            {editModalVisible && (
                <EditFollowupTask
                    open={editModalVisible}
                    taskId={selectedTaskId}
                    taskData={followupTask?.data?.find(task => task.id === selectedTaskId)}
                    onCancel={() => {
                        setEditModalVisible(false);
                        setSelectedTaskId(null);
                    }}
                    onSubmit={() => {
                        setEditModalVisible(false);
                        setSelectedTaskId(null);
                    }}
                />
            )}
        </>
    );
};

export default FollowupTaskList;
