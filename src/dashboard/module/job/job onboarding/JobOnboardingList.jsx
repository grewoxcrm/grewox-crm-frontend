import React from 'react';
import { Table, Tag, Dropdown, Button, Input, Space, DatePicker  } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye, FiCalendar } from 'react-icons/fi';
import dayjs from 'dayjs';

const JobOnboardingList = ({ onboardings, onEdit, onDelete, onView, loading }) => {
    // Function to get menu items for each row

    const statuses = [
        { id: 'pending', name: 'Pending' },
        { id: 'in_progress', name: 'In Progress' },
        { id: 'completed', name: 'Completed' },
        { id: 'delayed', name: 'Delayed' },
    ];  
    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <FiEye style={{ fontSize: '16px' }} />,
            label: 'View',
            onClick: () => onView(record)
        },
        {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '16px' }} />,
            label: 'Edit',
            onClick: () => onEdit(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => onDelete(record)
        }
    ];

    const columns = [
        {
            title: 'Interviewer',
            dataIndex: 'Interviewer',
            key: 'Interviewer',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search Interviewer"
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
                record.Interviewer.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Joining Date',
            dataIndex: 'JoiningDate',
            key: 'JoiningDate',
            render: (date) => dayjs(date).format('DD-MM-YYYY'),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <DatePicker
                        value={selectedKeys[0] ? dayjs(selectedKeys[0]) : null}
                        onChange={(date) => {
                            const dateStr = date ? date.format('YYYY-MM-DD') : null;
                            setSelectedKeys(dateStr ? [dateStr] : []);
                        }}
                        style={{ marginBottom: 8, display: 'block' }}
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
                        <Button
                            onClick={() => clearFilters()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => {
                if (!value || !record.JoiningDate) return false;
                return dayjs(record.JoiningDate).format('YYYY-MM-DD') === value;
            },
            filterIcon: filtered => (
                <FiCalendar style={{ color: filtered ? '#1890ff' : undefined }} />
            )
        },
        {
            title: 'Days of Week',
            dataIndex: 'DaysOfWeek',
            key: 'DaysOfWeek',
            sorter: (a, b) => a.DaysOfWeek.localeCompare(b.DaysOfWeek),
        },
        {
            title: 'Salary',
            dataIndex: 'Salary',
            key: 'Salary',
            sorter: (a, b) => a.Salary.localeCompare(b.Salary),
        },
        {
            title: 'Salary Type',
            dataIndex: 'SalaryType',
            key: 'SalaryType',
            sorter: (a, b) => a.SalaryType.localeCompare(b.SalaryType),
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            filters: statuses.map(status => ({
                text: status.name,
                value: status.id
              })),
              onFilter: (value, record) => record.status === value,
            render: (status) => {
                if (!status) return <Tag color="default">N/A</Tag>;
                
                let color;
                switch (status.toLowerCase()) {
                    case 'pending':
                        color = 'gold';
                        break;
                    case 'in_progress':
                        color = 'blue';
                        break;
                    case 'completed':
                        color = 'green';
                        break;
                    case 'delayed':
                        color = 'red';
                        break;
                    default:
                        color = 'default';
                }
                return (
                    <Tag color={color} style={{ textTransform: 'capitalize' }}>
                        {status.replace(/_/g, ' ')}
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
                    menu={{ items: getActionItems(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayStyle={{ minWidth: '150px' }}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical style={{ fontSize: '18px' }} />}
                        style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f2f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    />
                </Dropdown>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={onboardings}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} onboardings`
            }}
            style={{ background: '#ffffff', borderRadius: '8px' }}
        />
    );
};

export default JobOnboardingList; 