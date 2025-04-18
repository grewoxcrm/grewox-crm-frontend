import React from 'react';
import { Table, Button, Dropdown, Tag, Tooltip, Modal, message, Input, Space } from 'antd';
import {
    FiEye,
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiDollarSign,
    FiUsers,
    FiClock,
    FiHardDrive
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetAllCurrenciesQuery } from '../settings/services/settingsApi';
import moment from 'moment';

const PlanList = ({ plans, loading, onView, onEdit, onDelete, pagination, onPageChange, searchText }) => {
    const { data: currencies } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    // Define plan status options
    const planStatuses = [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
    ];

    const getCurrencyIcon = (currencyId) => {
        const currency = currencies?.find(c => c.id === currencyId);
        return currency?.currencyIcon || '$';
    };

    const highlightText = (text, highlight) => {
        if (!highlight.trim() || !text) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} style={{ backgroundColor: '#bae7ff' }}>
                            {part}
                        </span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(record),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit Plan',
                onClick: () => onEdit(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete Plan',
                danger: true,
                onClick: () => onDelete(record),
            }
        ]
    });

    const getActionItems = (record) => [
        {
            key: 'edit',
            icon: <FiEdit2 />,
            label: 'Edit Plan',
            onClick: () => onEdit(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 />,
            label: 'Delete Plan',
            danger: true,
            onClick: () => onDelete(record)
        }
    ];

    const formatStorageSize = (sizeInMB) => {
        const size = parseFloat(sizeInMB);
        if (size >= 1024) {
            const gbValue = size / 1024;
            // Remove decimals if it's a whole number
            return `${Number.isInteger(gbValue) ? gbValue.toFixed(0) : gbValue.toFixed(2)} GB`;
        }
        return `${size} MB`;
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
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
                record.name?.toLowerCase().includes(value.toLowerCase()),
            render: (text) => {
                if (!searchText?.trim() || !text) return <div style={{ fontWeight: 500 }}>{text || 'N/A'}</div>;

                const parts = text.split(new RegExp(`(${searchText})`, 'gi'));
                return (
                    <div style={{ fontWeight: 500 }}>
                        {parts.map((part, i) =>
                            part.toLowerCase() === searchText.toLowerCase() ? (
                                <span key={i} style={{ backgroundColor: '#bae7ff' }}>
                                    {part}
                                </span>
                            ) : (
                                part
                            )
                        )}
                    </div>
                );
            },
            width: '15%',
            fixed: 'left'
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
            render: (price, record) => (
                <div className="price-cell">
                    <span className="plan-price">
                        <small className="currency-duration">
                            {getCurrencyIcon(record.currency)}
                        </small>
                        {Number(price || 0).toFixed(2)}
                    </span>
                </div>
            ),
            width: '20%',
        },
        {
            title: 'Limits',
            key: 'limits',
            sorter: (a, b) => (a.max_users || 0) - (b.max_users || 0),
            render: (_, record) => (
                <div className="limits-cell">
                    <div className="limits-row">
                        <Tooltip title="Users Limit">
                            <Tag color="blue">
                                <FiUsers /> {record.max_users || 0} Users
                            </Tag>
                        </Tooltip>
                        <Tooltip title="Clients Limit">
                            <Tag color="cyan">
                                <FiUsers /> {record.max_clients || 0} Clients
                            </Tag>
                        </Tooltip>
                    </div>
                    <div className="limits-row">
                        <Tooltip title="Vendors Limit">
                            <Tag color="purple">
                                <FiUsers /> {record.max_vendors || 0} Vendors
                            </Tag>
                        </Tooltip>
                        <Tooltip title="Customers Limit">
                            <Tag color="magenta">
                                <FiUsers /> {record.max_customers || 0} Customers
                            </Tag>
                        </Tooltip>
                    </div>
                </div>
            ),
            width: '25%',
        },
        {
            title: 'Storage & Trial',
            key: 'storage_trial',
            sorter: (a, b) => (parseFloat(a.storage_limit) || 0) - (parseFloat(b.storage_limit) || 0),
            render: (_, record) => (
                <div className="storage-trial-cell">
                    <Tooltip title="Storage Limit">
                        <Tag color="orange">
                            <FiHardDrive /> {formatStorageSize(record.storage_limit)}
                        </Tag>
                    </Tooltip>
                    <Tooltip title="Trial Period">
                        <Tag color="green">
                            <FiClock /> {record.trial_period || 0} Days Trial
                        </Tag>
                    </Tooltip>
                </div>
            ),
            width: '20%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: planStatuses,
            onFilter: (value, record) => (record.status?.toLowerCase() || '') === value.toLowerCase(),
            render: (status) => (
                <span className={`plan-status ${status?.toLowerCase() || 'inactive'}`}>
                    {(status || 'Inactive').charAt(0).toUpperCase() + (status || 'inactive').slice(1)}
                </span>
            ),
            width: '10%',
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: getActionItems(record)
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="plan-actions-dropdown"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                        onClick={(e) => e.preventDefault()}
                    />
                </Dropdown>
            ),
            width: '80px',
            fixed: 'right'
        },
    ];

    return (
        <Table
            dataSource={plans}
            columns={columns}
            rowKey={record => record.id}
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={pagination}
            onChange={(pagination) => onPageChange?.(pagination.current, pagination.pageSize)}
            className="custom-table"
            style={{
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
        />
    );
};

export default PlanList;