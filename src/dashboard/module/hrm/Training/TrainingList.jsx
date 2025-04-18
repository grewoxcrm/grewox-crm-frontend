import React, { useMemo } from 'react';
import { Table, Space, Button, Tooltip, Modal, message, Tag, Dropdown, Input } from 'antd';
import { FiEdit2, FiTrash2, FiLink, FiEye, FiMoreVertical } from 'react-icons/fi';
import { useGetAllTrainingsQuery, useDeleteTrainingMutation } from './services/trainingApi';
import dayjs from 'dayjs';
import moment from 'moment';

const TrainingList = ({  loading, onEdit, onDelete, onView, searchText }) => {
    const { data: trainingsData, isLoading } = useGetAllTrainingsQuery();
    const [deleteTraining] = useDeleteTrainingMutation();

    // Transform trainings data
    const transformedTrainings = useMemo(() => {
        let data = [];
        
        if (!trainingsData) return [];
        if (Array.isArray(trainingsData)) {
            data = trainingsData;
        } else if (Array.isArray(trainingsData.data)) {
            data = trainingsData.data;
        }

        return data.map(training => ({
            ...training,
            key: training.id // Add key property for table
        }));
    }, [trainingsData]);

    // Filter trainings based on search text
    const filteredTrainings = useMemo(() => {
        if (!transformedTrainings.length) return [];
        
        if (!searchText) return transformedTrainings;

        const searchLower = searchText.toLowerCase();
        return transformedTrainings.filter(training => {
            const title = training.title?.toLowerCase() || '';
            return title.includes(searchLower);
        });
    }, [transformedTrainings, searchText]);

    console.log("filteredTrainings",filteredTrainings);

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Training',
            content: 'Are you sure you want to delete this training?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    await deleteTraining(id).unwrap();
                    message.success('Training deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete training');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search training title"
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
                (record.title?.toLowerCase() || '').includes(value.toLowerCase()),
            render: (title) => (
                <span className="text-base" style={{ 
                    color: searchText && title?.toLowerCase().includes(searchText.toLowerCase()) 
                        ? '#1890ff' 
                        : 'inherit' 
                }}>
                    {title || 'N/A'}
                </span>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
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
                record.category?.toLowerCase().includes(value.toLowerCase()),
            render: (category) => <Tag color="blue">{category || 'N/A'}</Tag>,
        },
        {
            title: 'Link',
            dataIndex: 'links',
            key: 'links',
            render: (links) => {
                if (!links) return <span className="text-base">N/A</span>;
                
                try {
                    // Parse the JSON string to get the URL array
                    const parsedLinks = JSON.parse(links);
                    const urlArray = parsedLinks.url || [];
                    
                    if (urlArray.length === 0) return <span className="text-base">N/A</span>;
                    
                    return (
                        <Space size="middle">
                            {urlArray.map((url, index) => (
                                <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: '#1890ff',
                                        textDecoration: 'none'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(url, '_blank');
                                    }}
                                >
                                    <FiLink size={14} />
                                    <span>Link {urlArray.length > 1 ? index + 1 : ''}</span>
                                </a>
                            ))}
                        </Space>
                    );
                } catch (error) {
                    console.error('Error parsing links:', error);
                    return <span className="text-base">N/A</span>;
                }
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => {
                const items = [
                    {
                        key: 'view',
                        icon: <FiEye style={{ fontSize: '14px' }} />,
                        label: 'View',
                        onClick: () => onView(record),
                    },
                    {
                        key: 'edit',
                        icon: <FiEdit2 style={{ fontSize: '14px' }} />,
                        label: 'Edit',
                        onClick: () => onEdit(record),
                    },
                    {
                        key: 'delete',
                        icon: <FiTrash2 style={{ fontSize: '14px', color: '#ff4d4f' }} />,
                        label: 'Delete',
                        danger: true,
                        onClick: () => handleDelete(record.id),
                    },
                ];

                return (
                    <Dropdown
                        menu={{ items }}
                        trigger={['click']}
                        placement="bottomRight"
                        overlayClassName="training-actions-dropdown"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical />}
                            className="action-dropdown-button"
                            onClick={(e) => e.preventDefault()}
                        />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div className="training-list">
            <Table
                columns={columns}
                dataSource={filteredTrainings}
                // loading={isLoading || loading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="training-table"
            />
        </div>
    );
};

export default TrainingList; 