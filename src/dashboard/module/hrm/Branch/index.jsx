import React, { useState } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, Space, Select, DatePicker
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiFilter
} from 'react-icons/fi';
import './branch.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateBranch from './CreateBranch';
import BranchList from './BranchList';
import { Link } from 'react-router-dom';
import { useGetAllBranchesQuery } from './services/branchApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Branch = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        dateRange: [],
        status: undefined,
        designationType: undefined
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch branches using RTK Query
    const { data: branchData, isLoading } = useGetAllBranchesQuery();

    const handleCreate = () => {
        setIsEditing(false);
        setSelectedBranch(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedBranch(record);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleViewBranch = (branch) => {
        setSelectedBranch(branch);
        // Implement view logic if needed
    };

    const handleDeleteConfirm = (branch) => {
        setSelectedBranch(branch);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteBranch = async () => {
        try {
            // TODO: Implement delete API call
            const updatedBranches = branchData.filter(b => b.id !== selectedBranch.id);
            // Assuming branchData is updated in the RTK Query
            // You might want to update the state or call the RTK Query again
            message.success('Branch deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete branch');
        }
    };

    const handleModalSubmit = () => {
        setIsModalOpen(false);
        setSelectedBranch(null);
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
            status: undefined,
            designationType: undefined
        });
        setSearchText('');
    };

    const exportToExcel = (data) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Branches');
        XLSX.writeFile(wb, 'branches_export.xlsx');
    };

    const exportToPDF = (data) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save('branches_export.pdf');
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
            link.setAttribute('download', 'branches_export.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleExport = (type) => {
        try {
            const formattedData = branchData?.data?.map(branch => ({
                'Branch Name': branch.branchName,
                'Designation Type': branch.designation_type || '-',
                'Created At': dayjs(branch.created_at).format('YYYY-MM-DD'),
                'Status': branch.status || '-'
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
        <div className="branch-page">
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
                    <Breadcrumb.Item>Branch</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Branches</Title>
                    <Text type="secondary">Manage all branches in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                            placeholder="Search branch..."
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
                            Add Branch
                        </Button>
                    </div>
                </div>
            </div>

            {showFilters && (
                <Card className="filter-card" style={{ marginBottom: '1rem' }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Select Designation Type"
                                style={{ width: '100%' }}
                                allowClear
                                value={filters.designationType}
                                onChange={(value) => handleFilterChange('designationType', value)}
                            >
                                <Option value="manager">Manager</Option>
                                <Option value="supervisor">Supervisor</Option>
                                <Option value="staff">Staff</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={filters.dateRange}
                                onChange={(dates) => handleFilterChange('dateRange', dates)}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
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
                        <Col xs={24} sm={12} md={6}>
                            <Button type="primary" onClick={clearFilters} block>
                                Clear Filters
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )}

            <Card className="branch-table-card">
                <BranchList 
                    onEdit={handleEdit} 
                    searchText={searchText}
                    filters={filters}
                />
            </Card>

            <CreateBranch
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedBranch(null);
                    setIsEditing(false);
                }}
                onSubmit={handleModalSubmit}
                isEditing={isEditing}
                initialValues={selectedBranch}
            />

            <Modal
                title="Delete Branch"
                open={isDeleteModalVisible}
                onOk={handleDeleteBranch}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: isLoading
                }}
            >
                <p>Are you sure you want to delete <strong>{selectedBranch?.name}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Branch;
