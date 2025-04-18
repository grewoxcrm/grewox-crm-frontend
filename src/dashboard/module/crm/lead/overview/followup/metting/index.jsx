import React, { useState } from 'react';
import { Table, Tag, Space, Button, Avatar, Tooltip, Dropdown, Modal, message } from 'antd';
import { FiCheckSquare, FiCalendar, FiEdit2, FiTrash2, FiMoreVertical, FiAlertCircle } from 'react-icons/fi';

import dayjs from 'dayjs';
import './followupmetting.scss';
import { useGetFollowupMeetingsQuery, useDeleteFollowupMeetingMutation } from './services/followupMettingApi';
import EditFollowupMeeting from './EditfollowupMeeting';

const FollowupMeetingList = ({ leadId, users }) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedMeetingId, setSelectedMeetingId] = useState(null);

    const { data: followupMeeting, isLoading: followupMeetingLoading } = useGetFollowupMeetingsQuery(leadId);
    const [deleteFollowupMeeting] = useDeleteFollowupMeetingMutation();

    const handleEdit = (meetingId) => {
        setSelectedMeetingId(meetingId);
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
                    await deleteFollowupMeeting(id).unwrap();
                    message.success('Meeting deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete meeting');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCheckSquare style={{ color: '#1890ff' }} />
                    <span>{text || '-'}</span>
                </div>
            )
        },
        {
            title: 'Meeting Type',
            dataIndex: 'meeting_type',
            key: 'meeting_type',
            render: (type) => {
                if (!type) return '-';
                return (
                    <Tag style={{
                        color: type === 'online' ? '#1890ff' : '#52c41a',
                        backgroundColor: type === 'online' ? '#e6f7ff' : '#f6ffed',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '2px 12px'
                    }}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Tag>
                );
            }
        },
        {
            title: 'Date & Time',
            key: 'datetime',
            render: (_, record) => {
                if (!record.from_date || !record.from_time) return '-';
                
                const fromDateTime = dayjs(`${record.from_date} ${record.from_time}`);
                const toDateTime = dayjs(`${record.to_date} ${record.to_time}`);
                
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiCalendar style={{ color: '#1890ff' }} />
                            <span>{fromDateTime.format('DD MMM YYYY')}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {fromDateTime.format('hh:mm A')} - {toDateTime.format('hh:mm A')}
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Location/Link',
            key: 'location',
            render: (_, record) => {
                if (record.meeting_type === 'online') {
                    return record.meeting_link || '-';
                }
                return record.location || record.venue || '-';
            }
        },
        {
            title: 'Assigned To',
            dataIndex: 'assigned_to',
            key: 'assigned_to',
            render: (assignedTo) => {
                if (!assignedTo) return '-';
                
                try {
                    const parsedAssignees = typeof assignedTo === 'string' ? JSON.parse(assignedTo) : assignedTo;
                    if (!parsedAssignees?.assigned_to?.length) return '-';

                    return (
                        <Avatar.Group maxCount={2} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                            {parsedAssignees.assigned_to.map((userId) => {
                                const user = users.find(u => u.id === userId);
                                if (!user) return null;
                                
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
                    console.error('Error parsing assignedTo:', e);
                    return '-';
                }
            }
        },
        {
            title: 'Reminder',
            key: 'reminder',
            render: (_, record) => {
                if (!record.reminder) return '-';
                
                try {
                    const parsedReminder = JSON.parse(record.reminder);
                    if (!parsedReminder.reminder_date || !parsedReminder.reminder_time) return '-';
                    
                    const reminderDateTime = dayjs(`${parsedReminder.reminder_date} ${parsedReminder.reminder_time}`);
                    return reminderDateTime.format('DD MMM YYYY hh:mm A');
                } catch (e) {
                    console.error('Error parsing reminder:', e);
                    return '-';
                }
            }
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (creator) => {
                if (!creator) return '-';
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                            {creator[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <span>{creator}</span>
                    </div>
                );
            }
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
                dataSource={followupMeeting?.data || []}
                columns={columns}
                rowKey="id"
                loading={followupMeetingLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} meetings`
                }}
                className="followup-table"
            />
            {editModalVisible && (
                <EditFollowupMeeting
                    open={editModalVisible}
                    meetingId={selectedMeetingId}
                    meetingData={followupMeeting?.data?.find(meeting => meeting.id === selectedMeetingId)}
                    onCancel={() => {
                        setEditModalVisible(false);
                        setSelectedMeetingId(null);
                    }}
                    onSubmit={() => {
                        setEditModalVisible(false);
                        setSelectedMeetingId(null);
                    }}
                />
            )}
        </>
    );
};

export default FollowupMeetingList;
