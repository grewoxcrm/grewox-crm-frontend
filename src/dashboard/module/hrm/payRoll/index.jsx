import React, { useState, useEffect, useRef } from 'react';
import {
    Typography,
    Button,
    Modal,
    message,
    Input,
    Dropdown,
    Menu,
    Breadcrumb,
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './salary.scss';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateSalary from './CreateSalary';
import SalaryList from './SalaryList';
import { Link } from 'react-router-dom';
import { useGetSalaryQuery } from './services/salaryApi';

const { Title, Text } = Typography;

const Salary = () => {
    const [salaries, setSalaries] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredSalaries, setFilteredSalaries] = useState([]);
    const searchInputRef = useRef(null);
    const { data: salaryData, isLoading: isSalaryLoading } = useGetSalaryQuery();

    useEffect(() => {
        if (salaryData?.data) {
            setSalaries(salaryData.data);
        }
    }, [salaryData]);

    useEffect(() => {
        handleSearch(searchText);
    }, [salaries, searchText]);

    const handleSearch = (value) => {
        setSearchText(value);
        let result = [...salaries];
        if (value) {
            result = result.filter(salary =>
                salary.employeeName?.toLowerCase().includes(value.toLowerCase()) ||
                salary.payslipType?.toLowerCase().includes(value.toLowerCase())
            );
        }
        setFilteredSalaries(result);
    };

    const handleAddSalary = () => {
        setSelectedSalary(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditSalary = (salary) => {
        const formattedSalary = {
            ...salary,
            paymentDate: dayjs(salary.paymentDate),
        };
        setSelectedSalary(formattedSalary);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDeleteConfirm = (salary) => {
        setSelectedSalary(salary);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteSalary = async () => {
        try {
            setLoading(true);
            // TODO: Implement delete API call
            const updatedSalaries = salaries.filter(s => s.id !== selectedSalary.id);
            setSalaries(updatedSalaries);
            message.success('Salary deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete salary');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            setLoading(true);
            const processedData = {
                ...formData,
                paymentDate: formData.paymentDate ? dayjs(formData.paymentDate).format('YYYY-MM-DD') : null,
            };

            if (isEditing) {
                // TODO: Implement update API call
                const updatedSalaries = salaries.map(s =>
                    s.id === selectedSalary.id ? { ...s, ...processedData } : s
                );
                setSalaries(updatedSalaries);
                message.success('Salary updated successfully');
            } else {
                // TODO: Implement create API call
                const newSalary = {
                    id: Date.now(),
                    ...processedData,
                    created_at: dayjs(),
                    created_by: 'Admin',
                    status: 'pending'
                };
                setSalaries([...salaries, newSalary]);
                message.success('Salary created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Salaries');
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

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = salaries.map(salary => ({
                'Employee Name': salary.employeeName,
                'Payslip Type': salary.payslipType,
                'Currency': salary.currency,
                'Salary': salary.salary,
                'Net Salary': salary.netSalary,
                'Payment Date': salary.paymentDate ? dayjs(salary.paymentDate).format('YYYY-MM-DD') : '',
                'Status': salary.status,
                'Bank Account': salary.bankAccount,
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'salaries_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'salaries_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'salaries_export');
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

    const exportMenu = (
        <Menu>
            <Menu.Item key="csv" icon={<FiDownload />} onClick={() => handleExport('csv')}>
                Export as CSV
            </Menu.Item>
            <Menu.Item key="excel" icon={<FiDownload />} onClick={() => handleExport('excel')}>
                Export as Excel
            </Menu.Item>
            <Menu.Item key="pdf" icon={<FiDownload />} onClick={() => handleExport('pdf')}>
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="salary-page">
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
                    <Breadcrumb.Item>Payroll</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Payroll Management</Title>
                    <Text type="secondary">Manage all salary records in the organization</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search salaries..."
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
                        value={searchText}
                        ref={searchInputRef}
                        className="search-input"
                    />
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
                            onClick={handleAddSalary}
                            className="add-button"
                        >
                            Add Salary
                        </Button>
                    </div>
                </div>
            </div>

            <div className="salary-table-card">
                <SalaryList
                    salaries={filteredSalaries}
                    loading={isSalaryLoading}
                    onEdit={handleEditSalary}
                    onDelete={handleDeleteConfirm}
                />
            </div>

            <CreateSalary
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedSalary}
                loading={loading}
            />

            <Modal
                title="Delete Salary"
                open={isDeleteModalVisible}
                onOk={handleDeleteSalary}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete this salary record?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Salary;
