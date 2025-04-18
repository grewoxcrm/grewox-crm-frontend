import React from 'react';
import { Table, Tag, Dropdown, Button, message, Input, Space } from 'antd';
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import moment from 'moment';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useUpdateJobApplicationMutation } from '../job applications/services/jobApplicationApi';


const JobCandidateList = ({ applications, onEdit, onDelete, onView, loading }) => {
    const { data: jobs, isLoading: jobsLoading } = useGetAllJobsQuery();
    

    // Function to get job title by job ID
    const getJobTitle = (jobId) => {
        if (!jobs || !jobs.data) return 'N/A';
        const job = jobs.data.find(job => job.id === jobId);
        return job ? job.title : 'N/A';
    };

 const statuses = [
        { id: 'pending', name: 'Pending' },
        { id: 'shortlisted', name: 'Shortlisted' },
        { id: 'selected', name: 'Selected' },
        { id: 'rejected', name: 'Rejected' },
    ];

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
                record.name?.toLowerCase().includes(value.toLowerCase()),
              sorter: (a, b) => {
                if (!a.name && !b.name) return 0;
                if (!a.name) return -1;
                if (!b.name) return 1;
                return a.name.localeCompare(b.name);
              },    
        },
        {
            title: 'Job',
            dataIndex: 'job',
            key: 'job',
            sorter: (a, b) => {
                if (!a.job && !b.job) return 0;
                if (!a.job) return -1;
                if (!b.job) return 1;
                return a.job.toString().localeCompare(b.job.toString());
            },
            render: (jobId) => getJobTitle(jobId)
        },  
        {
            title: 'Notice Period',
            dataIndex: 'notice_period',
            key: 'notice_period',
            sorter: (a, b) => {
                if (!a.notice_period && !b.notice_period) return 0;
                if (!a.notice_period) return -1;
                if (!b.notice_period) return 1;
                return a.notice_period.localeCompare(b.notice_period);
            },
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a, b) => {
                if (!a.phone && !b.phone) return 0;
                if (!a.phone) return -1;
                if (!b.phone) return 1;
                return a.phone.localeCompare(b.phone);
            },
        },
        {
            title: 'Experience',
            dataIndex: 'total_experience',
            key: 'total_experience',
            sorter: (a, b) => {
                if (!a.total_experience && !b.total_experience) return 0;
                if (!a.total_experience) return -1;
                if (!b.total_experience) return 1;
                return a.total_experience.localeCompare(b.total_experience);
            },
        },
        {
            title: 'Applied Source',
            dataIndex: 'applied_source',
            key: 'applied_source',
            sorter: (a, b) => {
                if (!a.applied_source && !b.applied_source) return 0;
                if (!a.applied_source) return -1;
                if (!b.applied_source) return 1;
                return a.applied_source.localeCompare(b.applied_source);
            },
        },
        {
            title: 'Cover Letter',
            dataIndex: 'cover_letter',
            key: 'cover_letter',
            render: (date) => date ? date.slice(0, 10) : 'N/A',
            sorter: (a, b) => {
                if (!a.cover_letter && !b.cover_letter) return 0;
                if (!a.cover_letter) return -1;
                if (!b.cover_letter) return 1;
                return moment(a.cover_letter).unix() - moment(b.cover_letter).unix();
            },
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
                if (!status) return <Tag color="default">N/A</Tag>;
                
                let color;
                switch (status.toLowerCase()) {
                    case 'pending': color = 'gold'; break;
                    case 'shortlisted': color = 'blue'; break;
                    case 'selected': color = 'green'; break;
                    case 'rejected': color = 'red'; break;
                    default: color = 'default';
                }
                return (
                    <Tag color={color} style={{ textTransform: 'capitalize' }}>
                        {status.replace(/_/g, ' ')}
                    </Tag>
                );
            }
        },
        // {
        //     title: 'Actions',
        //     key: 'actions',
        //     fixed: 'right',
        //     render: (_, record) => (
        //         <Dropdown
        //             menu={{ items: getActionItems(record) }}
        //             trigger={['click']}
        //             placement="bottomRight"
        //             overlayStyle={{ minWidth: '150px' }}
        //         >
        //             <Button
        //                 type="text"
        //                 icon={<FiMoreVertical style={{ fontSize: '18px' }} />}
        //                 style={{
        //                     width: '32px',
        //                     height: '32px',
        //                     display: 'flex',
        //                     alignItems: 'center',
        //                     justifyContent: 'center',
        //                     borderRadius: '6px',
        //                     transition: 'all 0.3s ease'
        //                 }}
        //                 onMouseEnter={(e) => {
        //                     e.currentTarget.style.background = '#f0f2f5';
        //                 }}
        //                 onMouseLeave={(e) => {
        //                     e.currentTarget.style.background = 'transparent';
        //                 }}
        //             />
        //         </Dropdown>
        //     )
        // }
    ];

    return (
        <Table
            columns={columns}
            dataSource={applications || []}
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

export default JobCandidateList;