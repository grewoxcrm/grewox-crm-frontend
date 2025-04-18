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
import '../job applications/jobApplications.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Link } from 'react-router-dom';
import { useGetAllJobApplicationsQuery, useDeleteJobApplicationMutation } from '../job applications/services/jobApplicationApi';
import { useSelector, useDispatch } from 'react-redux';
import JobCandidateList from '../job candidates/JobCandidateList';

const { Title, Text } = Typography;

const JobCandidates = () => {
    const dispatch = useDispatch();
    const filterState = useSelector(state => state.jobApplication) || {};
    
    // Add default values for all potentially undefined properties
    const { 
        filters = {}, 
        pagination = { 
            current: 1, 
            pageSize: 10,
            total: 0 
        }, 
        sorting = { 
            field: undefined, 
            order: undefined 
        } 
    } = filterState;
    
    // Use optional chaining and provide default values
    const { data: applications, isLoading } = useGetAllJobApplicationsQuery({
        ...filters,
        page: pagination?.current || 1,
        limit: pagination?.pageSize || 10,
        sortField: sorting?.field,
        sortOrder: sorting?.order,
    });

    const [deleteApplication] = useDeleteJobApplicationMutation();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const searchInputRef = useRef(null);

    const filteredApplications = React.useMemo(() => {
        if (!applications?.data) return [];
        
        return applications.data.filter(application => {
            if (!searchText) return true;
            
            const searchTerm = searchText.toLowerCase();
            return (
                application.name?.toLowerCase().includes(searchTerm) ||
                application.email?.toLowerCase().includes(searchTerm) ||
                application.phone?.toLowerCase().includes(searchTerm) ||
                application.location?.toLowerCase().includes(searchTerm) ||
                application.total_experience?.toLowerCase().includes(searchTerm) ||
                application.current_location?.toLowerCase().includes(searchTerm) ||
                application.notice_period?.toLowerCase().includes(searchTerm) ||
                application.status?.toLowerCase().includes(searchTerm) ||
                application.applied_source?.toLowerCase().includes(searchTerm)
            );
        });
    }, [applications, searchText]);

    const handleAddApplication = () => {
        setSelectedApplication(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditApplication = (application) => {
        setSelectedApplication(application);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Confirmation',
            content: 'Are you sure you want to delete this application?',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteApplication(record.id).unwrap();
                    message.success('Application deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete application');
                }
            },
        });
    };

    const handleFormClose = () => {
        setIsFormVisible(false);
        setSelectedApplication(null);
        setIsEditing(false);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
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
            const data = filteredApplications.map(application => ({

                'Applicant Name': application.name,
                'Email': application.email,
                'Phone': application.phone,
                'Position': application.job,
                'Experience': application.total_experience,
                'location': application.location,
                'Current Location': application.current_location,
                'Notice Period': application.notice_period,
                'Interview Date': application.interview_date,
                'Status': application.status,
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'job_applications_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'job_applications_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'job_applications_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Applications');
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
        <div className="job-applications-page">
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
                    <Breadcrumb.Item>Job Candidates</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Job Candidates</Title>
                    <Text type="secondary">Manage all job candidates</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search by name, email, phone, location..."
                        allowClear
                        onChange={handleSearch}
                        value={searchText}
                        style={{
                            width: '300px',
                            marginRight: '16px',
                            borderRadius: '20px'
                        }}
                    />
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button className="export-button">
                                <FiDownload size={16} />
                                <span>Export</span>
                                <FiChevronDown size={14} />
                            </Button>
                        </Dropdown>
                        {/* <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleAddApplication}
                            className="add-button"
                        >
                            Add Application
                        </Button> */}
                    </div>
                </div>
            </div>

            <Card className="job-applications-table-card">
                <JobCandidateList
                    applications={filteredApplications}
                    loading={isLoading}
                    onEdit={handleEditApplication}
                    onDelete={handleDelete}
                    onView={handleViewApplication}
                />
            </Card>


        </div>
    );
};

export default JobCandidates;
