import React, { useState } from 'react';
import { Card, Typography, Button, Input, Breadcrumb, Dropdown, Menu, message, Row, Col, Select, DatePicker } from 'antd';
import { FiPlus, FiSearch, FiHome, FiDownload, FiFilter } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import CreateDesignation from './CreateDesignation';
import DesignationList from './DesignationList';
import './designation.scss';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import { useGetAllDesignationsQuery } from './services/designationApi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Designation = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        dateRange: [],
        status: undefined
    });
    const [showFilters, setShowFilters] = useState(false);

    const { data: designationData } = useGetAllDesignationsQuery();

    const handleCreate = () => {
        setIsEditing(false);
        setSelectedDesignation(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedDesignation(record);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleModalSubmit = () => {
        setIsModalOpen(false);
        setSelectedDesignation(null);
        setIsEditing(false);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            dateRange: [],
            status: undefined
        });
        setSearchText('');
    };

    const exportToExcel = (data) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Designations');
        XLSX.writeFile(wb, 'designations_export.xlsx');
    };

    const exportToPDF = (data) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save('designations_export.pdf');
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
            link.setAttribute('download', 'designations_export.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleExport = (type) => {
        try {
            const formattedData = designationData?.data?.map(designation => ({
                'Designation Name': designation.designation_name,
                'Branch': designation.branch_name || '-',
                'Created At': dayjs(designation.created_at).format('YYYY-MM-DD'),
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
        <div className="designation-page">
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
                    <Breadcrumb.Item>Designation</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Designations</Title>
                    <Text type="secondary">Manage all designations in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                            placeholder="Search designations..."
                            allowClear
                            onSearch={(value) => setSearchText(value)}
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            className="search-input"
                            style={{ 
                                width: '300px', 
                                borderRadius: '20px',
                                height: '38px'
                            }}
                        />
                    </div>
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button
                                icon={<FiDownload size={16} />}
                                className="export-button"
                                style={{ marginRight: '10px' }}
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
                            Add Designation
                        </Button>
                    </div>
                </div>
            </div>

            {showFilters && (
                <Card className="filter-card" style={{ marginBottom: '1rem' }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={filters.dateRange}
                                onChange={(dates) => handleFilterChange('dateRange', dates)}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Select
                                placeholder="Select Status"
                                style={{ width: '100%' }}
                                allowClear
                                value={filters.status}
                                onChange={(value) => handleFilterChange('status', value)}
                            >
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Button type="primary" onClick={clearFilters} block>
                                Clear Filters
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )}

            <Card className="designation-table-card">
                <DesignationList
                    onEdit={handleEdit}
                    searchText={searchText}
                    filters={filters}
                />
            </Card>

            <CreateDesignation
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedDesignation(null);
                    setIsEditing(false);
                }}
                onSubmit={handleModalSubmit}
                isEditing={isEditing}
                initialValues={selectedDesignation}
            />
        </div>
    );
};

export default Designation;
