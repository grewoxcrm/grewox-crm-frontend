import React, { useState } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, Space, Select, DatePicker
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiFilter,
    FiCalendar
} from 'react-icons/fi';
import './holiday.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateHoliday from './CreateHoliday';
import EditHoliday from './EditHoliday';
import HolidayList from './HolidayList';
import { Link } from 'react-router-dom';
import { useGetAllHolidaysQuery } from './services/holidayApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Holiday = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedHoliday, setSelectedHoliday] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        dateRange: [],
        status: undefined,
        leave_type: undefined
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch holidays using RTK Query
    const { data: holidayData, isLoading } = useGetAllHolidaysQuery();

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleEdit = (record) => {
        // Convert dates to proper format before setting
        const formattedRecord = {
            ...record,
            start_date: record.start_date ? dayjs(record.start_date) : null,
            end_date: record.end_date ? dayjs(record.end_date) : null
        };
        setSelectedHoliday(formattedRecord);
        setIsEditModalOpen(true);
    };

    const handleDeleteConfirm = (holiday) => {
        setSelectedHoliday(holiday);
        setIsDeleteModalVisible(true);
    };

    const handleCreateSubmit = () => {
        setIsCreateModalOpen(false);
        message.success('Holiday created successfully');
    };

    const handleEditSubmit = () => {
        setIsEditModalOpen(false);
        setSelectedHoliday(null);
        message.success('Holiday updated successfully');
    };

    const handleFilterChange = (key, value) => {
        if (key === 'dateRange' && Array.isArray(value)) {
            const [start, end] = value;
            setFilters(prev => ({
                ...prev,
                dateRange: [
                    start ? dayjs(start).startOf('day') : null,
                    end ? dayjs(end).endOf('day') : null
                ]
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [key]: value
            }));
        }
    };

    const clearFilters = () => {
        setFilters({
            dateRange: [],
            status: undefined,
            leave_type: undefined
        });
        setSearchText('');
    };

    const exportToExcel = (data) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Holidays');
        XLSX.writeFile(wb, 'holidays_export.xlsx');
    };

    const exportToPDF = (data) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save('holidays_export.pdf');
    };

    const exportToCSV = (data) => {
        const csvContent = [
            Object.keys(data[0]).join(','),
            ...data.map(item => Object.values(item).map(value =>
                `"${value?.toString().replace(/"/g, '""')}"`
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'holidays_export.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleExport = (type) => {
        try {
            const formattedData = holidayData?.data?.map(holiday => ({
                'Holiday Name': holiday.holiday_name,
                'Holiday Type': holiday.leave_type || '-',
                'Start Date': dayjs(holiday.start_date).format('YYYY-MM-DD'),
                'End Date': dayjs(holiday.end_date).format('YYYY-MM-DD'),
                'Created At': dayjs(holiday.createdAt).format('YYYY-MM-DD'),
                'Status': holiday.status || '-'
            })) || [];

            if (formattedData.length === 0) {
                message.warning('No data to export');
                return;
            }

            switch (type) {
                case 'excel':
                    exportToExcel(formattedData);
                    message.success('Successfully exported as Excel');
                    break;
                case 'pdf':
                    exportToPDF(formattedData);
                    message.success('Successfully exported as PDF');
                    break;
                case 'csv':
                    exportToCSV(formattedData);
                    message.success('Successfully exported as CSV');
                    break;
                default:
                    break;
            }
        } catch (error) {
            message.error('Failed to export data');
        }
    };

    const exportMenu = (
        <Menu>
            <Menu.Item key="excel" icon={<FiDownload />} onClick={() => handleExport('excel')}>
                Export as Excel
            </Menu.Item>
            <Menu.Item key="pdf" icon={<FiDownload />} onClick={() => handleExport('pdf')}>
                Export as PDF
            </Menu.Item>
            <Menu.Item key="csv" icon={<FiDownload />} onClick={() => handleExport('csv')}>
                Export as CSV
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="holiday-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/hrm">HRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <FiCalendar style={{ marginRight: '4px' }} />
                        Holiday
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Holidays</Title>
                    <Text type="secondary">Manage all holidays in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-filter-group" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                            placeholder="Search by holiday name..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            className="search-input"
                            style={{ 
                                width: '300px', 
                                borderRadius: '20px',
                                height: '38px'
                            }}
                        />
                        <RangePicker
                            onChange={(dates) => handleFilterChange('dateRange', dates)}
                            value={filters.dateRange}
                            allowClear
                            style={{ width: 300 , height: 40}}
                            placeholder={['Start Date', 'End Date']}
                        />
                    </div>
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button
                                icon={<FiDownload size={16} />}
                                className="export-button"
                            >
                                Export
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleCreate}
                            className="add-button"
                        >
                            Add Holiday
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="holiday-table-card">
                <HolidayList 
                    onEdit={handleEdit} 
                    searchText={searchText}
                    filters={filters}
                />
            </Card>

            <CreateHoliday
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSubmit}
            />

            <EditHoliday
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedHoliday(null);
                }}
                onSubmit={handleEditSubmit}
                initialValues={selectedHoliday}
            />

            <Modal
                title="Delete Holiday"
                open={isDeleteModalVisible}
                onOk={() => {
                    // Handle delete
                    setIsDeleteModalVisible(false);
                    setSelectedHoliday(null);
                }}
                onCancel={() => {
                    setIsDeleteModalVisible(false);
                    setSelectedHoliday(null);
                }}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: isLoading
                }}
            >
                <p>Are you sure you want to delete <strong>{selectedHoliday?.holiday_name}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Holiday;