import React from 'react';
import { Card, Table, Typography, Tag, Avatar, Radio, Input, Button, Space } from 'antd';
import { FiTarget } from 'react-icons/fi';

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
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f2ff 100%)',
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
        background: '#e6f4ff',
        border: 'none',
        color: '#1890ff',
        fontWeight: '600',
        fontSize: '13px',
        '@media (max-width: 576px)': {
            fontSize: '12px',
        }
    }
};

const LeadsTable = ({
    leads,
    // loading,
    currencies,
    statusesData,
    dateFilter,
    setDateFilter,
    navigate
}) => {
    const filterLeadsByDate = (leads) => {
        if (!leads) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

        return leads.filter(lead => {
            const leadDate = new Date(lead.createdAt);
            switch (dateFilter) {
                case 'today':
                    return leadDate >= today;
                case 'month':
                    return leadDate >= firstDayOfMonth;
                case 'year':
                    return leadDate >= firstDayOfYear;
                default:
                    return true;
            }
        });
    };

    const columns = [
        {
            title: "Lead Title",
            dataIndex: "leadTitle",
            key: "leadTitle",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search leads..."
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
                record.leadTitle.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                    <Avatar style={{
                        backgroundColor: record.is_converted ? '#52c41a' : '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {text && text[0] ? text[0].toUpperCase() : 'L'}
                    </Avatar>
                    <Text strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text || 'Untitled Lead'}
                    </Text>
                </div>
            ),
            responsive: ['xs', 'sm', 'md', 'lg', 'xl']
        },
        {
            title: "Interest Level",
            dataIndex: "interest_level",
            key: "interest_level",
            filters: [
                { text: 'High', value: 'high' },
                { text: 'Medium', value: 'medium' },
                { text: 'Low', value: 'low' }
            ],
            onFilter: (value, record) => record.interest_level === value,
            render: (level) => {
                const interestStyle = {
                    high: {
                        color: '#52c41a',
                        bg: 'rgba(82, 196, 26, 0.1)',
                        icon: <FiTarget style={{ marginRight: '4px' }} />,
                        text: 'High'
                    },
                    medium: {
                        color: '#faad14',
                        bg: 'rgba(250, 173, 20, 0.1)',
                        icon: <FiTarget style={{ marginRight: '4px' }} />,
                        text: 'Med'
                    },
                    low: {
                        color: '#ff4d4f',
                        bg: 'rgba(255, 77, 79, 0.1)',
                        icon: <FiTarget style={{ marginRight: '4px' }} />,
                        text: 'Low'
                    }
                }[level] || {
                    color: '#1890ff',
                    bg: 'rgba(24, 144, 255, 0.1)',
                    icon: <FiTarget style={{ marginRight: '4px' }} />,
                    text: '-'
                };

                return (
                    <Tag style={{
                        color: interestStyle.color,
                        backgroundColor: interestStyle.bg,
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                    }}>
                        {interestStyle.icon}
                        {interestStyle.text}
                    </Tag>
                );
            },
            responsive: ['sm', 'md', 'lg', 'xl']
        },
        {
            title: "Value",
            dataIndex: "leadValue",
            key: "leadValue",
            sorter: (a, b) => (a.leadValue || 0) - (b.leadValue || 0),
            render: (value, record) => {
                const currency = currencies?.find(c => c.id === record.currency);
                return (
                    <Text strong style={{ fontSize: '13px', color: '#52c41a', whiteSpace: 'nowrap' }}>
                        {currency?.currencyIcon || ''} {(value || 0).toLocaleString()}
                    </Text>
                );
            },
            responsive: ['sm', 'md', 'lg', 'xl']
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            filters: statusesData?.map(status => ({
                text: status.name,
                value: status.id
            })) || [],
            onFilter: (value, record) => record.status === value,
            render: (statusId) => {
                const status = statusesData?.find(s => s.id === statusId) || {};
                const statusName = status.name || "Unknown";
                const statusColor = {
                    'Active': 'success',
                    'Closed': 'error',
                    'Pending': 'warning'
                }[statusName] || 'default';

                return (
                    <Tag color={statusColor} style={{
                        textTransform: 'capitalize',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                    }}>
                        {statusName}
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
                            <FiTarget style={{ color: 'white', fontSize: '16px' }} />
                        </div>
                        <Text strong style={responsiveStyles.titleText}>
                            Lead Data
                        </Text>
                        <Tag style={responsiveStyles.totalTag}>
                            {leads?.length || 0} Total
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
                    dataSource={filterLeadsByDate(leads)}
                    columns={columns}
                    // loading={loading}
                    rowKey="id"
                    size="middle"
                    pagination={{
                        pageSize: 5,
                        total: filterLeadsByDate(leads)?.length,
                        showTotal: (total) => `Total ${total} leads`,
                        showSizeChanger: false,
                        hideOnSinglePage: true,
                        style: {
                            marginTop: '12px',
                            padding: '8px 16px',
                            background: '#f8fafc',
                            borderRadius: '0 0 8px 8px'
                        }
                    }}
                    style={{
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                    onRow={(record) => ({
                        onClick: () => navigate(`/dashboard/crm/lead/${record.id}`),
                        style: { cursor: 'pointer' }
                    })}
                    scroll={{ x: 'max-content' }}
                    locale={{
                        emptyText: (
                            <div style={{
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Text type="secondary">No leads found</Text>
                            </div>
                        )
                    }}
                />
            </div>
        </Card>
    );
};

export default LeadsTable; 