import React from 'react';
import { Table, Button, Tag, Dropdown, Input, Space } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';

const JobList = ({ jobs, loading, onEdit, onDelete, onView }) => {
    const { data: currencies } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    const getCurrencyDetails = (currencyId) => {
        if (!currencies || !currencyId) return { icon: '', code: '' };
        const currency = currencies.find(c => c.id === currencyId);
        return {
            icon: currency?.currencyIcon || '',
            code: currency?.currencyCode || ''
        };
    };

    const statuses = [
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
    ];
    // Define action items for dropdown
    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <FiEye />,
            label: 'View Details',
            onClick: () => onView?.(record)
        },
        {
            key: 'edit',
            icon: <FiEdit2 />,
            label: 'Edit Job',
            onClick: () => onEdit?.(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 />,
            label: 'Delete Job',
            danger: true,
            onClick: () => onDelete?.(record)
        }
    ];

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search job title"
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
                record.title.toLowerCase().includes(value.toLowerCase()),

        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search category"
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
                record.category.toLowerCase().includes(value.toLowerCase()),

        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
            render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : 'N/A'
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
            render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : 'N/A'
        },
        {
            title: 'Experience',
            dataIndex: 'workExperience',
            key: 'workExperience',
            sorter: (a, b) => (a.workExperience || '').localeCompare(b.workExperience || '')

        },
        {
            title: 'Salary',
            key: 'salary',
            sorter: (a, b) => (a.expectedSalary || '').localeCompare(b.expectedSalary || ''),
            render: (record) => {
                const currencyDetails = getCurrencyDetails(record.currency);
                return (
                    <span>
                        {currencyDetails.icon} {record.expectedSalary || 'N/A'}
                    </span>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: statuses.map(status => ({
                text: status.name,
                value: status.id
            })),
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                let color = 'blue';
                switch (status?.toLowerCase()) {
                    case 'active':
                        color = 'green';
                        break;
                    case 'inactive':
                        color = 'red';
                        break;
                    case 'draft':
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
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: getActionItems(record)
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical className="text-lg" />}
                        className="action-button"
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            ),
        },
    ];

    // Transform the jobs data to ensure each row has a unique key
    const tableData = React.useMemo(() => {
        return jobs.map(job => ({
            ...job,
            key: job.id
        }));
    }, [jobs]);

    return (
        <Table
            columns={columns}
            dataSource={tableData}
            pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} jobs`,
            }}
            className="custom-table"
            scroll={{ x: 1000 }}
            style={{
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
        />
    );
};

export default JobList; 