import React, { useState, useMemo } from 'react';
import { Table, Space, Button, Tag, message, Modal, Dropdown, Input, DatePicker } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiCalendar } from 'react-icons/fi';
import { useGetMeetingsQuery, useUpdateMeetingMutation, useDeleteMeetingMutation } from './services/meetingApi';
import { useGetAllDepartmentsQuery } from '../Department/services/departmentApi';
import dayjs from 'dayjs';
import CreateMeeting from './CreateMeeting';

const MeetingList = ({ searchText }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);

    // API calls
    const { data: meetings, isLoading } = useGetMeetingsQuery();
    const { data: departmentsData } = useGetAllDepartmentsQuery();
    const [updateMeeting] = useUpdateMeetingMutation();
    const [deleteMeeting] = useDeleteMeetingMutation();

    // Create a map of department IDs to names
    const departmentMap = useMemo(() => {
        const map = {};
        if (departmentsData?.data) {
            departmentsData.data.forEach(dept => {
                if (dept && dept.id) {
                    map[dept.id] = dept.department_name;
                }
            });
        }
        return map;
    }, [departmentsData]);

    const statuses = [
        { id: 'scheduled', name: 'Scheduled' },
        { id: 'completed', name: 'Completed' },
        { id: 'cancelled', name: 'Cancelled' },
    ];

    // Filter meetings based on search text
    const filteredMeetings = useMemo(() => {
        if (!meetings?.data) return [];
        
        if (!searchText) return meetings.data;

        const searchLower = searchText.toLowerCase();
        return meetings.data.filter(meeting => {
            const title = meeting.title?.toLowerCase() || '';
            const description = meeting.description?.toLowerCase() || '';
            const department = departmentMap[meeting.department]?.toLowerCase() || '';
            const location = meeting.location?.toLowerCase() || '';
            
            return (
                title.includes(searchLower) ||
                description.includes(searchLower) ||
                department.includes(searchLower) ||
                location.includes(searchLower)
            );
        });
    }, [meetings?.data, searchText, departmentMap]);

    // Handle edit
    const handleEdit = (record) => {
        // Format the dates before setting them in the form
        const formattedRecord = {
            ...record,
            date: record.date && dayjs(record.date),
            startTime: record.startTime && dayjs(record.startTime, 'HH:mm'),
            endTime: record.endTime && dayjs(record.endTime, 'HH:mm'),
        };
        setEditingMeeting(formattedRecord);
        setIsModalOpen(true);
    };

    // Handle delete
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Meeting',
            content: 'Are you sure you want to delete this meeting?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    await deleteMeeting(id).unwrap();
                    message.success('Meeting deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete meeting');
                }
            },
        });
    };

    // Handle update
    const handleUpdate = async (values) => {
        try {
            const formattedValues = {
                ...values,
                // Use proper dayjs validation and formatting
                date: values.date && dayjs(values.date).format('YYYY-MM-DD'),
                startTime: values.startTime && dayjs(values.startTime).format('HH:mm'),
                endTime: values.endTime && dayjs(values.endTime).format('HH:mm'),
                client_id: localStorage.getItem('client_id'),
            };

            await updateMeeting({
                id: editingMeeting.id,
                data: formattedValues
            }).unwrap();

            message.success('Meeting updated successfully');
            setIsModalOpen(false);
            setEditingMeeting(null);
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update meeting');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search meeting title"
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
                record.title.toLowerCase().includes(value.toLowerCase()) ||
                record.department?.toLowerCase().includes(value.toLowerCase()), 
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search department"
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
                record.department.toLowerCase().includes(value.toLowerCase()) ||
                record.title?.toLowerCase().includes(value.toLowerCase()),  
            render: (departmentId) => (
                <span style={{ color: '#4b5563' }}>
                    {departmentMap[departmentId] || 'N/A'}
                </span>
            ),
           
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
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
                if (!value || !record.date) return false;
                return dayjs(record.date).format('YYYY-MM-DD') === value;
            },
            filterIcon: filtered => (
                <FiCalendar style={{ color: filtered ? '#1890ff' : undefined }} />
            )
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            sorter: (a, b) => a.startTime.localeCompare(b.startTime),
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            sorter: (a, b) => a.endTime.localeCompare(b.endTime),
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
            render: (status) => (
                <Tag color={
                    status === 'scheduled' ? 'blue' :
                    status === 'completed' ? 'green' : 'red'
                }>
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const items = [
                    {
                        key: 'view',
                        icon: <FiEye style={{ fontSize: '14px' }} />,
                        label: 'View',
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: 'edit',
                        icon: <FiEdit2 style={{ fontSize: '14px' }} />,
                        label: 'Edit',
                        onClick: () => handleEdit(record),
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
                        overlayClassName="meeting-actions-dropdown"
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
        <div style={{ padding: '24px' }}>
            <Table 
                columns={columns}
                dataSource={filteredMeetings}
                // loading={isLoading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    total: filteredMeetings?.length,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} meetings`,
                    showQuickJumper: true,
                    size: "default",
                    position: ["bottomRight"],
                }}
            />

            {/* Edit Modal */}
            <CreateMeeting
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingMeeting(null);
                }}
                onSubmit={handleUpdate}
                initialValues={editingMeeting}
                isEditing={true}
            />
        </div>
    );
};

export default MeetingList;