import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Space, Select
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiFilter
} from 'react-icons/fi';
import './department.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateDepartment from './CreateDepartment';
import { Link } from 'react-router-dom';
import DepartmentList from './DepartmentList';

const { Title, Text } = Typography;
const { Option } = Select;

const Department = () => {
    const [departments, setDepartments] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        branch: undefined
    });
    const searchInputRef = useRef(null);

   

    const handleAddDepartment = () => {
        setSelectedDepartment(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditDepartment = (department) => {
        setSelectedDepartment(department);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDeleteConfirm = (department) => {
        setSelectedDepartment(department);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteDepartment = async () => {
        try {
            // TODO: Implement delete API call
            const updatedDepartments = departments.filter(d => d.id !== selectedDepartment.id);
            setDepartments(updatedDepartments);
            message.success('Department deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete department');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedDepartments = departments.map(d =>
                    d.id === selectedDepartment.id ? { ...d, ...formData } : d
                );
                setDepartments(updatedDepartments);
                message.success('Department updated successfully');
            } else {
                const newDepartment = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                    created_by: 'Admin'
                };
                setDepartments([...departments, newDepartment]);
                message.success('Department created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleFilterChange = (type, value) => {
        setFilters(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            branch: undefined
        });
        setSearchText('');
        if (searchInputRef.current) {
            searchInputRef.current.input.value = '';
        }
    };

    const exportMenu = (
        <Menu>
            <Menu.Item
                key="csv"
                icon={<FiDownload />}
                onClick={() => handleExport('csv')}
            >
                Export as CSV
            </Menu.Item>
            <Menu.Item
                key="excel"
                icon={<FiDownload />}
                onClick={() => handleExport('excel')}
            >
                Export as Excel
            </Menu.Item>
            <Menu.Item
                key="pdf"
                icon={<FiDownload />}
                onClick={() => handleExport('pdf')}
            >
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = departments.map(department => ({
                'Department': department.department,
                'Branch': department.branch,
                'Created Date': moment(department.created_at).format('YYYY-MM-DD'),
                'Created By': department.created_by
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'departments_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'departments_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'departments_export');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
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
            link.setAttribute('download', `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const exportToExcel = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Departments');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save(`${filename}.pdf`);
    };

  return (
        <div className="department-page">
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
                    <Breadcrumb.Item>Department</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Departments</Title>
                    <Text type="secondary">Manage all departments in the organization</Text>
                </div>
                <div className="header-actions">
                    <Space size={16} className="filter-section">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                            placeholder="Search departments..."
                            allowClear
                            onChange={(e) => handleSearch(e.target.value)}
                            value={searchText}
                            ref={searchInputRef}
                            className="search-input"
                            style={{ width: '250px' }}
                        />
                      
                    </Space>
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button className="export-button">
                                <FiDownload size={16} />
                                <span>Export</span>
                                <FiChevronDown size={14} />
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleAddDepartment}
                            className="add-button"
                        >
                            Add Department
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="department-table-card">
                <DepartmentList
                    searchText={searchText}
                    filters={filters}
                    onEdit={handleEditDepartment}
                />
            </Card>

            <CreateDepartment
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedDepartment}
                loading={loading}
            />

            <Modal
                title="Delete Department"
                open={isDeleteModalVisible}
                onOk={handleDeleteDepartment}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete this department?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Department;
