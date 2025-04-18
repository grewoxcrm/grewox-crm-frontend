import React, { useState, useMemo } from 'react';
import { Table, Space, Button, Tooltip, Tag, message, Modal, Dropdown, Input } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import { useGetAllHolidaysQuery, useDeleteHolidayMutation } from './services/holidayApi';
import dayjs from 'dayjs';

const HolidayList = ({ onEdit, searchText = '', filters = {} }) => {
    // RTK Query hooks
    const { data: holidaysData = [], isLoading } = useGetAllHolidaysQuery();
    const [deleteHoliday] = useDeleteHolidayMutation();

    // Define leave types
    const leaveTypes = [
        { text: 'Paid', value: 'paid' },
        { text: 'Unpaid', value: 'unpaid' }
    ];

    // Transform holidays data
    const holidays = useMemo(() => {
        let filteredData = [];
        
        if (!holidaysData) return [];
        if (Array.isArray(holidaysData)) {
            filteredData = holidaysData;
        } else if (Array.isArray(holidaysData.data)) {
            filteredData = holidaysData.data;
        }

        // Apply filters
        return filteredData.filter(holiday => {
            if (!holiday) return false;

            const matchesSearch = !searchText || searchText.toLowerCase() === '' ||
                (holiday.holiday_name || '').toLowerCase().includes(searchText.toLowerCase());

            const matchesType = !filters.leave_type ||
                holiday.leave_type === filters.leave_type;

            const matchesStatus = !filters.status ||
                holiday.status === filters.status;

            const matchesDateRange = !filters.dateRange?.length ||
                (dayjs(holiday.start_date).isValid() && dayjs(holiday.end_date).isValid() &&
                dayjs(holiday.start_date).isAfter(dayjs(filters.dateRange[0])) &&
                dayjs(holiday.end_date).isBefore(dayjs(filters.dateRange[1])));

            return matchesSearch && matchesType && matchesStatus && matchesDateRange;
        });
    }, [holidaysData, searchText, filters]);

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Holiday',
            content: 'Are you sure you want to delete this holiday?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    await deleteHoliday(id).unwrap();
                    message.success('Holiday deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete holiday');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Holiday Name',
            dataIndex: 'holiday_name',
            key: 'holiday_name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search holiday name"
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
                (record.holiday_name?.toLowerCase() || '').includes(value.toLowerCase()),
            render: (text) => <span className="text-base">{text || 'N/A'}</span>,
        },
        {
            title: 'Leave Type',
            dataIndex: 'leave_type',
            key: 'leave_type',
            filters: leaveTypes,
            onFilter: (value, record) => record.leave_type === value,
            render: (type) => (
                <Tag color={type === 'paid' ? 'green' : 'blue'}>
                    {type || 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
            key: 'start_date',
            render: (date) => (
                <span>{dayjs(date).isValid() ? dayjs(date).format('DD-MM-YYYY') : 'N/A'}</span>
            ),
            sorter: (a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix(),
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
            key: 'end_date',
            render: (date) => (
                <span>{dayjs(date).isValid() ? dayjs(date).format('DD-MM-YYYY') : 'N/A'}</span>
            ),
            sorter: (a, b) => dayjs(a.end_date).unix() - dayjs(b.end_date).unix(),
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => {
                const start = dayjs(record.start_date);
                const end = dayjs(record.end_date);
                const days = end.diff(start, 'day') + 1; // Adding 1 to include both start and end dates
                return <span>{days} day{days > 1 ? 's' : ''}</span>;
            },
            sorter: (a, b) => a.duration - b.duration,
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
                        onClick: () => onEdit(record),
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
                        overlayClassName="holiday-actions-dropdown"
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
        <div className="holiday-list">
            <Table
                columns={columns}
                dataSource={holidays}
                loading={isLoading}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="holiday-table"
            />
        </div>
    );
};

export default HolidayList;