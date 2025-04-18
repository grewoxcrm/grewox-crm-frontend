import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome
} from 'react-icons/fi';
import './jobOnboarding.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateJobOnboarding from './CreateJobOnboarding';
import JobOnboardingList from './JobOnboardingList';
import { Link } from 'react-router-dom';
import { useGetAllJobOnboardingQuery, useDeleteJobOnboardingMutation } from './services/jobOnboardingApi';

const { Title, Text } = Typography;

const JobOnboarding = () => {
    const [onboardings, setOnboardings] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedOnboarding, setSelectedOnboarding] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredOnboardings, setFilteredOnboardings] = useState([]);
    const searchInputRef = useRef(null);

    // Use RTK Query hooks
    const { data: onboardingsData, isLoading } = useGetAllJobOnboardingQuery();
    const [deleteOnboarding] = useDeleteJobOnboardingMutation();

    useEffect(() => {
        if (onboardingsData?.data) {
            setOnboardings(onboardingsData.data);
            setFilteredOnboardings(onboardingsData.data);
        }
    }, [onboardingsData]);

    useEffect(() => {
        let result = [...onboardings];
        if (searchText) {
            result = result.filter(onboarding =>
                onboarding.Interviewer?.toLowerCase().includes(searchText.toLowerCase()) ||
                onboarding.Status?.toLowerCase().includes(searchText.toLowerCase()) ||
                onboarding.SalaryType?.toLowerCase().includes(searchText.toLowerCase()) ||
                onboarding.JobType?.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        setFilteredOnboardings(result);
    }, [onboardings, searchText]);

    const handleAddOnboarding = () => {
        setSelectedOnboarding(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditOnboarding = (onboarding) => {
        setSelectedOnboarding(onboarding);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewOnboarding = (onboarding) => {
        setSelectedOnboarding(onboarding);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Confirmation',
            content: 'Are you sure you want to delete this designation?',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteOnboarding(record.id).unwrap();
                    message.success('Job deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete job');
                }
            },
        });
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedOnboardings = onboardings.map(o =>
                    o.id === selectedOnboarding.id ? { ...o, ...formData } : o
                );
                setOnboardings(updatedOnboardings);
                message.success('Onboarding record updated successfully');
            } else {
                const newOnboarding = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                };
                setOnboardings([...onboardings, newOnboarding]);
                message.success('Onboarding record created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
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
            const data = onboardings.map(onboarding => ({
                'Employee Name': onboarding.employee_name,
                'Position': onboarding.position,
                'Department': onboarding.department,
                'Joining Date': onboarding.joining_date,
                'Mentor': onboarding.mentor,
                'Status': onboarding.status,
                'Tasks Completed': onboarding.tasks_completed,
                'Documents Submitted': onboarding.documents_submitted,
                'Orientation Date': onboarding.orientation_date
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'job_onboarding_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'job_onboarding_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'job_onboarding_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Onboarding');
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
        <div className="job-onboarding-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/job">Job</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Job Onboarding</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Job Onboarding</Title>
                    <Text type="secondary">Manage employee onboarding process</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search by interviewer, status, salary type..."
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
                            onClick={handleAddOnboarding}
                            className="add-button"
                        >
                            Add Onboarding
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="job-onboarding-table-card">
                <JobOnboardingList
                    onboardings={filteredOnboardings}
                    loading={isLoading}
                    onEdit={handleEditOnboarding}
                    onDelete={handleDelete}
                    onView={handleViewOnboarding}
                />
            </Card>

            <CreateJobOnboarding
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                
                initialValues={selectedOnboarding}
                loading={loading}
            />

           
        </div>
    );
};

export default JobOnboarding;
