import React from 'react';
import { Card, Table, Typography, Tag, Avatar, Radio, Input, Button, Space } from 'antd';
import { FiFileText } from 'react-icons/fi';

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
        borderBottom: '1px solid #e6ffec',
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
        background: '#52c41a',
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
        background: 'linear-gradient(90deg, #52c41a, #95de64)',
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
        background: '#f6ffed',
        border: 'none',
        color: '#52c41a',
        fontWeight: '600',
        fontSize: '13px',
        '@media (max-width: 576px)': {
            fontSize: '12px',
        }
    }
};

const DealsTable = ({
    deals,
    // loading,
    currencies,
    stagesData,
    dateFilter,
    setDateFilter,
    navigate
}) => {
    const filterDealsByDate = (deals) => {
        if (!deals) return [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

        return deals.filter(deal => {
            const dealDate = new Date(deal.createdAt);
            switch (dateFilter) {
                case 'today':
                    return dealDate >= today;
                case 'month':
                    return dealDate >= firstDayOfMonth;
                case 'year':
                    return dealDate >= firstDayOfYear;
                default:
                    return true;
            }
        });
    };

    const columns = [
        {
            title: "Deal Title",
            dataIndex: "dealTitle",
            key: "dealTitle",
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search deals..."
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
                record.dealTitle?.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                    <Avatar style={{
                        backgroundColor: record.is_won ? '#52c41a' : '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {text && text[0] ? text[0].toUpperCase() : 'D'}
                    </Avatar>
                    <Text strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text || 'Untitled Deal'}
                    </Text>
                </div>
            ),
            responsive: ['xs', 'sm', 'md', 'lg', 'xl']
        },
        {
            title: "Stage",
            dataIndex: "stage",
            key: "stage",
            filters: stagesData?.filter(stage => stage.stageType === "deal").map(stage => ({
                text: stage.stageName,
                value: stage.id
            })) || [],
            onFilter: (value, record) => record.stage === value,
            render: (stageId) => {
                const stage = stagesData?.filter(stage => stage.stageType === "deal").find(s => s.id === stageId);
                return (
                    <Tag style={{
                        textTransform: 'capitalize',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'white',
                        background: stage?.color || '#1890ff',
                        whiteSpace: 'nowrap'
                    }}>
                        {stage?.stageName || 'Unknown Stage'}
                    </Tag>
                );
            },
            responsive: ['sm', 'md', 'lg', 'xl']
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
            sorter: (a, b) => (a.value || 0) - (b.value || 0),
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
            filters: [
                { text: 'Won', value: 'won' },
                { text: 'Pending', value: 'pending' },
                { text: 'Lost', value: 'lost' }
            ],
            onFilter: (value, record) => {
                if (value === 'won') return record.is_won === true;
                if (value === 'lost') return record.is_won === false;
                return record.is_won === null;
            },
            render: (status, record) => {
                const statusName = record.is_won === true ? 'Won' :
                    record.is_won === false ? 'Lost' : 'Pending';
                const statusColor = {
                    'Won': 'success',
                    'Lost': 'error',
                    'Pending': 'warning'
                }[statusName];

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
                            <FiFileText style={{ color: 'white', fontSize: '16px' }} />
                        </div>
                        <Text strong style={responsiveStyles.titleText}>
                            Deal Data
                        </Text>
                        <Tag style={responsiveStyles.totalTag}>
                            {deals?.length || 0} Total
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
                    dataSource={filterDealsByDate(deals)}
                    columns={columns}
                    // loading={loading}
                    rowKey="id"
                    size="middle"
                    pagination={{
                        pageSize: 5,
                        total: filterDealsByDate(deals)?.length,
                        showTotal: (total) => `Total ${total} deals`,
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
                        onClick: () => navigate(`/dashboard/crm/deal/${record.id}`),
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
                                {/* <FiFileText style={{ fontSize: '24px', color: '#8c8c8c' }} /> */}
                                <Text type="secondary">No deals found</Text>
                            </div>
                        )
                    }}
                />
            </div>
        </Card>
    );
};

export default DealsTable;