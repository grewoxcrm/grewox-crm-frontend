import React, { useCallback, useState } from 'react';
import { Table, Button, Tag, message, Switch, Popconfirm, Input, Space } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';
import { useGetAllSubscribedUsersQuery } from './services/SubscribedUserApi';
import moment from 'moment'; // Import moment for date formatting
import { useGetAllPlansQuery } from '../plans/services/planApi';
import { useGetAllCompaniesQuery, useRemovePlanMutation } from '../company/services/companyApi';
import StorageUsageDisplay from './components/StorageUsageDisplay';

const SubscribedUserList = ({ data, loading }) => {
    const { data: companiesData } = useGetAllCompaniesQuery();
    const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });
    const { data: plansData } = useGetAllPlansQuery(filters);
    const [removePlan] = useRemovePlanMutation();

    // Define payment status options
    const paymentStatuses = [
        { text: 'Paid', value: 'paid' },
        { text: 'Unpaid', value: 'unpaid' },
        { text: 'Pending', value: 'pending' }
    ];

    // Use the passed data instead of making a new query
    const users = React.useMemo(() => {
        if (!data) return [];
        return Array.isArray(data) ? data : [];
    }, [data]);

    // Memoized function to get plan name with null check
    const getPlanName = useCallback((planId) => {
        if (!plansData?.data) return 'N/A';
        const plan = plansData.data.find(plan => plan.id === planId);
        return plan ? plan.name : 'N/A';
    }, [plansData]);

    // Memoized function to get company name with null check
    const getCompanyName = useCallback((companyId) => {
        if (!companiesData?.data) return 'N/A';
        const company = companiesData.data.find(company => company.id === companyId);
        return company ? (company.company_name || company.username || 'N/A') : 'N/A';
    }, [companiesData]);

    const handleStatusChange = async (record) => {
        try {
            await removePlan(record.id).unwrap();
            message.success('Subscription status updated successfully');
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update subscription status');
        }
    };

    const columns = [
        {
            title: 'Plan Name',
            dataIndex: 'plan_id',
            key: 'plan_id',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search plan name"
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
                record.plan_id.toLowerCase().includes(value.toLowerCase()),
            render: (planId) => getPlanName(planId),
        },
        {
            title: 'Client Name',
            dataIndex: 'client_id',
            key: 'client_id',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search client name"
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
                record.client_id.toLowerCase().includes(value.toLowerCase()),
            render: (clientId) => getCompanyName(clientId),
        },
        {
            title: 'Storage Usage',
            dataIndex: 'storage',
            key: 'storage',
            sorter: (a, b) => {
                const aUsed = a.storage?.used || 0;
                const bUsed = b.storage?.used || 0;
                return aUsed - bUsed;
            },
            render: (_, record) => {
                const { used, total, percentage } = record.storage || {};
                return (
                    <StorageUsageDisplay
                        used={used}
                        total={total}
                        percentage={percentage}
                    />
                );
            }
        },
        {
            title: 'Payment Status',
            dataIndex: 'payment_status',
            key: 'payment_status',
            filters: paymentStatuses,
            onFilter: (value, record) =>
                (record.payment_status?.toLowerCase() || '') === value.toLowerCase(),
            render: (status) => {
                let color = 'blue';
                switch (status?.toLowerCase()) {
                    case 'paid':
                        color = 'green';
                        break;
                    case 'unpaid':
                        color = 'red';
                        break;
                    case 'pending':
                        color = 'orange';
                        break;
                    default:
                        color = 'blue';
                }
                return (
                    <Tag color={color} style={{ textTransform: 'capitalize' }}>
                        {status?.replace(/_/g, ' ') || 'N/A'}
                    </Tag>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_, record) => (
                <Popconfirm
                    title={record.status !== 'cancelled' ?
                        "Deactivate Subscription?" :
                        "Subscription is inactive"}
                    description={record.status !== 'cancelled' ?
                        "This will prevent the company from accessing their account." :
                        "This subscription is no longer active."}
                    onConfirm={() => handleStatusChange(record)}
                    okText="Yes"
                    cancelText="No"
                    disabled={record.status === 'cancelled'}
                >
                    <Switch
                        checked={record.status !== 'cancelled'}
                        className={`status-switch ${record.status !== 'cancelled' ? 'active' : 'inactive'}`}
                        disabled={record.status === 'cancelled'}
                    />
                </Popconfirm>
            )
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
            key: 'start_date',
            sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
            render: (date) => moment(date).format('DD MMM YYYY')
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
            key: 'end_date',
            sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
            render: (date) => moment(date).format('DD MMM YYYY')
        }
    ];

    // Transform the users data to ensure each row has a unique key
    const tableData = React.useMemo(() => {
        return users.map(user => ({
            ...user,
            key: user.id
        }));
    }, [users]);

    return (
        <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
            }}
            className="custom-table"
            scroll={{ x: 1200 }}
            style={{
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
        />
    );
};

export default SubscribedUserList;
