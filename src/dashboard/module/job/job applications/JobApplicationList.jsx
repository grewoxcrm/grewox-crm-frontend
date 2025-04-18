import React from 'react';
import { Table, Tag, Dropdown, Button, message, Input, Space } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import moment from 'moment';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useUpdateJobApplicationMutation } from './services/jobApplicationApi';


const JobApplicationList = ({ applications, onEdit, onDelete, onView, loading }) => {
    const [updateJobApplication] = useUpdateJobApplicationMutation();
    const { data: jobs, isLoading: jobsLoading } = useGetAllJobsQuery();
    
    const statuses = [
        { id: 'pending', name: 'Pending' },
        { id: 'shortlisted', name: 'Shortlisted' },
        { id: 'selected', name: 'Selected' },
        { id: 'rejected', name: 'Rejected' },
    ];

    // Function to get job title by job ID
    const getJobTitle = (jobId) => {
        if (!jobs) return 'Loading...';
        const job = jobs.data.find(job => job.id === jobId);
        return job ? job.title : 'N/A';
    };

 

    // Function to get menu items for each row
    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <FiEye style={{ fontSize: '16px' }} />,
            label: 'View',
            onClick: () => onView?.(record)
        },
        {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '16px' }} />,
            label: 'Edit',
            onClick: () => onEdit?.(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => onDelete?.(record)
        }
    ];

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search candidate name"
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
                record.name.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Job',
            dataIndex: 'job',
            key: 'job',
            sorter: (a, b) => a.job.localeCompare(b.job),
            render: (jobId) => getJobTitle(jobId)
        },
        {
            title: 'Notice Period',
            dataIndex: 'notice_period',
            key: 'notice_period',
            sorter: (a, b) => a.notice_period.localeCompare(b.notice_period),
        },
       
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a, b) => a.phone.localeCompare(b.phone),   
        },
        {
            title: 'Experience',
            dataIndex: 'total_experience',
            key: 'total_experience',
            sorter: (a, b) => a.total_experience.localeCompare(b.total_experience),
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
                let color;
                switch (status?.toLowerCase()) {
                    case 'pending': color = 'gold'; break;
                    case 'shortlisted': color = 'blue'; break;
                    case 'selected': color = 'green'; break;
                    case 'rejected': color = 'red'; break;
                    default: color = 'default';
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
            fixed: 'right',
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
            dataSource={applications}
            rowKey="id"
            scroll={{ x: 1500 }}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} applications`
            }}
            style={{ background: '#ffffff', borderRadius: '8px' }}
        />
    );
};

export default JobApplicationList;