import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Radio, Avatar, Input, Button, Space, Tooltip, Modal } from 'antd';
import { FiVideo } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

// Add responsive styles object
const responsiveStyles = {
    tableWrapper: {
        overflow: 'auto',
        '@media (max-width: 768px)': {
            margin: '0 -16px',
        }
    },
    headerContainer: {
        background: 'linear-gradient(135deg, #ffffff 0%, #e6f7ff 100%)',
        borderBottom: '1px solid #e6f4ff',
        padding: '16px',
        borderRadius: '8px 8px 0 0',
        '@media (max-width: 768px)': {
            padding: '12px',
        }
    },
    headerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '12px',
        '@media (max-width: 576px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
        }
    },
    titleSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        '@media (max-width: 576px)': {
            width: '100%',
        }
    },
    filterSection: {
        '@media (max-width: 576px)': {
            width: '100%',
            '.ant-radio-group': {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
            },
            '.ant-radio-button-wrapper': {
                flex: '1',
                textAlign: 'center',
                minWidth: 'calc(50% - 4px)',
            }
        }
    },
    iconContainer: {
        background: '#1890ff',
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    titleText: {
        fontSize: '18px',
        color: '#1f2937',
        background: 'linear-gradient(90deg, #1890ff, #69c0ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: '600',
        letterSpacing: '-0.02em',
        '@media (max-width: 576px)': {
            fontSize: '16px',
        }
    },
    totalTag: {
        marginLeft: '8px',
        background: '#e6f7ff',
        border: 'none',
        color: '#1890ff',
        fontWeight: '600',
        fontSize: '13px',
        '@media (max-width: 576px)': {
            fontSize: '12px',
        }
    }
};

const MeetingsTable = ({
    meetings,
    // loading,
    dateFilter,
    setDateFilter,
    navigate
}) => {
    const filterMeetingsByDate = (meetings) => {
        if (!meetings) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

        return meetings.filter(meeting => {
            const meetingDate = new Date(meeting.date);
            switch (dateFilter) {
                case 'today':
                    return meetingDate >= today;
                case 'month':
                    return meetingDate >= firstDayOfMonth;
                case 'year':
                    return meetingDate >= firstDayOfYear;
                default:
                    return true;
            }
        });
    };

    const columns = [
        {
            title: "Meeting Title",
            dataIndex: "title",
            key: "title",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search meetings..."
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: '100%', marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button type="primary" onClick={() => confirm()} size="small">Search</Button>
                        <Button onClick={clearFilters} size="small">Reset</Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) =>
                record.title?.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                    <Avatar style={{
                        backgroundColor: record.meetingLink ? '#52c41a' : '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <FiVideo style={{ color: 'white' }} />
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                        <Text strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {text}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {record.description || 'No description'}
                        </Text>
                    </div>
                </div>
            ),
            responsive: ['xs', 'sm', 'md', 'lg', 'xl']
        },
        {
            title: "Time",
            dataIndex: "startTime",
            key: "time",
            render: (startTime, record) => (
                <div style={{ whiteSpace: 'nowrap' }}>
                    <Text strong style={{ display: 'block' }}>
                        {dayjs(record.date).format('MMM DD, YYYY')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(`2000-01-01T${startTime}`).format('hh:mm A')} -
                        {dayjs(`2000-01-01T${record.endTime}`).format('hh:mm A')}
                    </Text>
                </div>
            ),
            responsive: ['sm', 'md', 'lg', 'xl']
        },
        {
            title: "Participants",
            dataIndex: "employee",
            key: "employee",
            render: (employees) => {
                const employeeArray = employees ? JSON.parse(employees) : [];
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                        <Avatar.Group maxCount={3}>
                            {employeeArray.map((emp, index) => (
                                <Avatar key={index} style={{ backgroundColor: '#1890ff' }}>
                                    {emp.slice(0, 2).toUpperCase()}
                                </Avatar>
                            ))}
                        </Avatar.Group>
                        <Text type="secondary" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                            {employeeArray.length} {employeeArray.length === 1 ? 'participant' : 'participants'}
                        </Text>
                    </div>
                );
            },
            responsive: ['sm', 'md', 'lg', 'xl']
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const statusConfig = {
                    scheduled: {
                        color: '#1890ff',
                        bg: '#e6f7ff'
                    },
                    completed: {
                        color: '#52c41a',
                        bg: '#f6ffed'
                    },
                    cancelled: {
                        color: '#ff4d4f',
                        bg: '#fff1f0'
                    }
                };

                const config = statusConfig[status.toLowerCase()] || statusConfig.scheduled;

                return (
                    <Tag style={{
                        color: config.color,
                        backgroundColor: config.bg,
                        border: `1px solid ${config.color}`,
                        textTransform: 'capitalize',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                    }}>
                        {status}
                    </Tag>
                );
            },
            responsive: ['md', 'lg', 'xl']
        }
    ];

    return (
        <Card
            className="leads-table-card"
            bodyStyle={{ padding: 0 }}
            style={{ height: '100%' }}
        >
            <div style={responsiveStyles.headerContainer}>
                <div style={responsiveStyles.headerContent}>
                    <div style={responsiveStyles.titleSection}>
                        <div style={responsiveStyles.iconContainer}>
                            <FiVideo style={{ color: 'white', fontSize: '16px' }} />
                        </div>
                        <Text strong style={responsiveStyles.titleText}>
                            Meeting Data
                        </Text>
                        <Tag style={responsiveStyles.totalTag}>
                            {meetings?.length || 0} Total
                        </Tag>
                    </div>
                    <div style={responsiveStyles.filterSection}>
                        <Radio.Group
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            size="small"
                        >
                            <Radio.Button value="all" style={{ fontSize: '12px', fontWeight: '500' }}>All Time</Radio.Button>
                            <Radio.Button value="today" style={{ fontSize: '12px', fontWeight: '500' }}>Today</Radio.Button>
                            <Radio.Button value="month" style={{ fontSize: '12px', fontWeight: '500' }}>This Month</Radio.Button>
                            <Radio.Button value="year" style={{ fontSize: '12px', fontWeight: '500' }}>This Year</Radio.Button>
                        </Radio.Group>
                    </div>
                </div>
            </div>

            <div style={responsiveStyles.tableWrapper}>
                <Table
                    dataSource={filterMeetingsByDate(meetings)}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    className="colorful-table fixed-height-table"
                    onRow={(record) => ({
                        onClick: () => navigate(`/dashboard/hrm/meeting/${record.id}`),
                        style: { cursor: 'pointer' }
                    })}
                    scroll={{ x: true }}
                    // loading={loading}
                    locale={{
                        emptyText: (
                            <div style={{ 
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {/* <FiVideo style={{ fontSize: '24px', color: '#8c8c8c' }} /> */}
                                <Text type="secondary">No meetings found</Text>
                            </div>
                        )
                    }}
                />
            </div>
        </Card>
    );
};

export default MeetingsTable;